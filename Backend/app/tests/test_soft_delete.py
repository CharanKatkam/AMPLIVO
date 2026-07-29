import uuid

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.services import (
    get_audit_service,
    get_email_service,
    get_email_verification_service,
)
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def _build_user_service(db_session: AsyncSession) -> UserService:
    audit_service = get_audit_service(db_session)
    email_verification_service = get_email_verification_service(
        db_session, audit_service, get_email_service()
    )
    return UserService(UserRepository(db_session), audit_service, email_verification_service)


PAYLOAD = {
    "email": "todelete.user@amplivo.com",
    "username": "todelete_user",
    "full_name": "To Delete",
    "password": "SecurePass123",
}


async def _register_and_get_id(client: AsyncClient) -> uuid.UUID:
    response = await client.post("/api/v1/auth/register", json=PAYLOAD)
    assert response.status_code == 201
    return uuid.UUID(response.json()["id"])


async def test_soft_delete_marks_user_and_sets_metadata(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_and_get_id(client)
    deleter_id = uuid.uuid4()

    user_service = _build_user_service(db_session)
    deleted_user = await user_service.soft_delete_user(user_id, deleted_by=deleter_id)
    await db_session.commit()

    assert deleted_user.is_deleted is True
    assert deleted_user.deleted_at is not None
    assert deleted_user.deleted_by == deleter_id


async def test_soft_deleted_user_cannot_login(client: AsyncClient, db_session: AsyncSession) -> None:
    user_id = await _register_and_get_id(client)

    user_service = _build_user_service(db_session)
    await user_service.soft_delete_user(user_id, deleted_by=None)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_credentials"


async def test_soft_deleted_user_loses_access_via_existing_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_and_get_id(client)

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    me_before = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_before.status_code == 200

    user_service = _build_user_service(db_session)
    await user_service.soft_delete_user(user_id, deleted_by=None)
    await db_session.commit()

    me_after = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_after.status_code == 404
    assert me_after.json()["error_code"] == "user_not_found"
