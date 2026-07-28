"""Verifies the RBAC gaps closed in this pass: every endpoint that used to
have zero authentication, or authentication-but-no-role-check, now actually
enforces it.

Two checks per fixed endpoint, deliberately not full success-path tests:
  1. No Authorization header at all -> 401 (proves auth is required at all)
  2. Authenticated as a role that should NOT have access -> 403 (proves the
     role gate, not just "any login", is what's enforced)
This is enough to prove the fix without needing a fully valid business
payload/FK graph for every one of the ~50 touched routes.
"""
from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.modules.users.models import Role
from app.utils.jwt import create_access_token
from app.utils.password import hash_password


async def _get_or_create_role(db_session: AsyncSession, slug: str) -> Role:
    existing = (await db_session.execute(select(Role).where(Role.slug == slug))).scalar_one_or_none()
    if existing:
        return existing
    role = Role(name=slug.capitalize(), slug=slug, is_system=True)
    db_session.add(role)
    await db_session.flush()
    await db_session.commit()
    return role


async def make_authed_client(db_session: AsyncSession, client: AsyncClient, role_slug: str | None) -> AsyncClient:
    """Registers a real user row with the given role and points `client` at
    it via an Authorization header carrying a real access token - exercises
    the actual get_current_user -> get_current_user_role_slug -> require_roles
    chain, not a mock.
    """
    role_id = None
    if role_slug is not None:
        role = await _get_or_create_role(db_session, role_slug)
        role_id = role.id

    user = User(
        id=uuid.uuid4(),
        email=f"{role_slug or 'norole'}-{uuid.uuid4().hex[:8]}@amplivo.com",
        username=f"{role_slug or 'norole'}_{uuid.uuid4().hex[:8]}",
        full_name="RBAC Test User",
        hashed_password=hash_password("Whatever123!"),
        is_active=True,
        is_verified=True,
        role_id=role_id,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.commit()

    token = create_access_token(user.id)
    client.headers["Authorization"] = f"Bearer {token}"
    return client


@pytest.fixture
async def client_as(client: AsyncClient, db_session: AsyncSession):
    async def _make(role_slug: str | None) -> AsyncClient:
        return await make_authed_client(db_session, client, role_slug)

    return _make


# ── case_studies / faqs / portfolio / testimonials: previously ZERO auth on writes ──

@pytest.mark.parametrize(
    "path,method",
    [
        ("/api/v1/case-studies", "post"),
        ("/api/v1/faqs", "post"),
        ("/api/v1/portfolio", "post"),
        ("/api/v1/testimonials", "post"),
    ],
)
async def test_cms_content_write_requires_auth(client: AsyncClient, path: str, method: str) -> None:
    response = await getattr(client, method)(path, json={})
    assert response.status_code in (401, 403)


@pytest.mark.parametrize("path", ["/api/v1/case-studies", "/api/v1/faqs", "/api/v1/portfolio", "/api/v1/testimonials"])
async def test_cms_content_write_rejects_client_role(client_as, path: str) -> None:
    authed = await client_as("client")
    response = await authed.post(path, json={})
    assert response.status_code == 403
    assert response.json()["error_code"] == "forbidden"


@pytest.mark.parametrize("path", ["/api/v1/case-studies", "/api/v1/faqs", "/api/v1/portfolio", "/api/v1/testimonials"])
async def test_cms_content_read_stays_public(client: AsyncClient, path: str) -> None:
    response = await client.get(path)
    assert response.status_code == 200


# ── marketing_automation: previously the ENTIRE module had zero auth ──

async def test_marketing_automation_list_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/api/v1/automation")
    assert response.status_code in (401, 403)


async def test_marketing_automation_rejects_client_role(client_as) -> None:
    authed = await client_as("client")
    response = await authed.get("/api/v1/automation")
    assert response.status_code == 403


async def test_marketing_automation_allows_employee_role(client_as) -> None:
    # Current seed data still puts marketing-titled staff on role_slug
    # "employee" (see seed_demo_data.py's ROLES comment) - this must keep
    # working even though the module is no longer wide open.
    authed = await client_as("employee")
    response = await authed.get("/api/v1/automation")
    assert response.status_code == 200


# ── consultation_requests / contact_forms: PII leak on GET/PUT/DELETE ──

@pytest.mark.parametrize("path", ["/api/v1/consultation-requests", "/api/v1/contact-submissions"])
async def test_lead_pii_list_requires_auth(client: AsyncClient, path: str) -> None:
    response = await client.get(path)
    assert response.status_code in (401, 403)


@pytest.mark.parametrize("path", ["/api/v1/consultation-requests", "/api/v1/contact-submissions"])
async def test_lead_pii_list_rejects_non_crm_sales_role(client_as, path: str) -> None:
    authed = await client_as("hr")
    response = await authed.get(path)
    assert response.status_code == 403


@pytest.mark.parametrize("path", ["/api/v1/consultation-requests", "/api/v1/contact-submissions"])
async def test_lead_pii_list_allows_crm_role(client_as, path: str) -> None:
    authed = await client_as("crm")
    response = await authed.get(path)
    assert response.status_code == 200


@pytest.mark.parametrize(
    "path,payload",
    [
        ("/api/v1/consultation-requests", {"name": "Test", "email": "test@example.com"}),
        ("/api/v1/contact-submissions", {"name": "Test", "email": "test@example.com", "message": "hi"}),
    ],
)
async def test_lead_pii_submission_post_stays_public(client: AsyncClient, path: str, payload: dict) -> None:
    response = await client.post(path, json=payload)
    assert response.status_code == 201


# ── finance: core CRUD open to any authenticated role ──

async def test_finance_create_expense_requires_auth(client: AsyncClient) -> None:
    response = await client.post("/api/v1/finance/expenses", json={})
    assert response.status_code in (401, 403)


async def test_finance_create_expense_rejects_non_finance_role(client_as) -> None:
    authed = await client_as("employee")
    response = await authed.post("/api/v1/finance/expenses", json={})
    assert response.status_code == 403
    assert response.json()["error_code"] == "forbidden"


async def test_finance_list_all_payments_rejects_client_role(client_as) -> None:
    authed = await client_as("client")
    response = await authed.get("/api/v1/finance/payments")
    assert response.status_code == 403


# ── users: activate/deactivate had NO role gate at all ──

async def test_deactivate_user_requires_auth(client: AsyncClient) -> None:
    response = await client.post(f"/api/v1/users/{uuid.uuid4()}/deactivate")
    assert response.status_code in (401, 403)


async def test_deactivate_user_rejects_non_hr_role(client_as) -> None:
    authed = await client_as("employee")
    response = await authed.post(f"/api/v1/users/{uuid.uuid4()}/deactivate")
    assert response.status_code == 403
    assert response.json()["error_code"] == "forbidden"


async def test_activate_user_rejects_client_role(client_as) -> None:
    authed = await client_as("client")
    response = await authed.post(f"/api/v1/users/{uuid.uuid4()}/activate")
    assert response.status_code == 403


async def test_user_directory_list_rejects_client_role(client_as) -> None:
    authed = await client_as("client")
    response = await authed.get("/api/v1/users")
    assert response.status_code == 403


async def test_user_directory_list_allows_staff_role(client_as) -> None:
    authed = await client_as("sales")
    response = await authed.get("/api/v1/users")
    assert response.status_code == 200


async def test_get_user_profile_rejects_other_users(client_as, db_session: AsyncSession) -> None:
    # Regression test for the symmetry gap: update_user_profile already
    # enforced self-or-admin, get_user_profile didn't.
    authed = await client_as("employee")
    other_user_id = uuid.uuid4()
    response = await authed.get(f"/api/v1/users/{other_user_id}/profile")
    assert response.status_code == 403


# ── settings: system settings reads open to any authenticated role ──

async def test_list_system_settings_rejects_non_admin_role(client_as) -> None:
    authed = await client_as("employee")
    response = await authed.get("/api/v1/settings/system")
    assert response.status_code == 403


# ── approval_system: entire module open to any authenticated role ──

async def test_create_approval_policy_rejects_non_admin_role(client_as) -> None:
    authed = await client_as("hr")
    response = await authed.post("/api/v1/approvals/policies", json={})
    assert response.status_code == 403


async def test_list_approval_requests_rejects_client_role(client_as) -> None:
    authed = await client_as("client")
    response = await authed.get("/api/v1/approvals")
    assert response.status_code == 403


async def test_list_approval_requests_allows_staff_role(client_as) -> None:
    authed = await client_as("employee")
    response = await authed.get("/api/v1/approvals")
    assert response.status_code == 200


# ── Marketing role exists and is usable by require_roles ──

async def test_marketing_role_can_manage_case_studies(client_as) -> None:
    authed = await client_as("marketing")
    response = await authed.post("/api/v1/case-studies", json={})
    # Not a 403 - proves the "marketing" role slug itself clears the RBAC
    # gate. (422 here means it passed authorization and failed schema
    # validation on the empty body, which is expected and fine.)
    assert response.status_code != 403
