"""Orchestrates the ONLY point in the workflow where a client gets a real
login: once CRM has verified the client's advance payment
(app/modules/finance/service.py PaymentService.crm_verify). Spans
Users + Clients + Leads + Email, so it isn't naturally owned by any single
module - same reasoning as email_verification_service.py/
password_reset_service.py living at the app-services layer.
"""
from __future__ import annotations

import re
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core import lead_pipeline
from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user import User
from app.modules.leads.repository import LeadActivityRepository, LeadRepository
from app.modules.leads.service import LeadService
from app.modules.users.models import UserProfile
from app.modules.users.repository import RoleRepository, UserProfileRepository
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailDeliveryError, EmailService
from app.utils.password import generate_temp_password, hash_password
from app.utils.sales_events import log_activity, notify_role


class ClientAccountService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._lead_repo = LeadRepository(db)
        self._lead_service = LeadService(db, self._lead_repo, LeadActivityRepository(db))
        self._user_repo = UserRepository(db)

    async def create_portal_account_for_client(self, lead_id: uuid.UUID, *, actor_id: uuid.UUID | None) -> User:
        lead = await self._lead_repo.get_by_id(lead_id)
        if lead is None:
            raise NotFoundException("Lead")

        # Idempotency: a retried crm_verify (e.g. two payments both pushing
        # the invoice over its total) must not create a second account.
        if lead.converted_client_id is not None:
            existing = await self._user_repo.get_by_client_id(lead.converted_client_id)
            if existing is not None:
                return existing

        client_id = await self._lead_service.ensure_client_for_lead(lead, actor_id)

        existing = await self._user_repo.get_by_client_id(client_id)
        if existing is not None:
            return existing

        role = await RoleRepository(self._db).get_by_slug("client")
        if role is None:
            raise BadRequestException("No 'client' role is configured - cannot create a portal account.")
        if not lead.email:
            raise BadRequestException("Lead has no email on file - cannot create a portal account.")
        if await self._user_repo.exists_by_email(lead.email):
            # A different client_id already owns an account with this email -
            # surface a clear, actionable error instead of a raw DB
            # constraint violation (500) from the INSERT below.
            raise BadRequestException(
                f"A user account already exists for {lead.email} under a different client - "
                "resolve this manually (e.g. update the lead's contact email) before payment verification can proceed."
            )

        full_name = lead.contact_name or lead.title
        username = await self._unique_username(full_name)
        temp_password = generate_temp_password()

        user = await self._user_repo.create(
            email=lead.email,
            username=username,
            full_name=full_name,
            hashed_password=hash_password(temp_password),
            role_id=role.id,
            client_id=client_id,
            user_type="client",
            is_verified=True,
        )
        await UserProfileRepository(self._db).create(UserProfile(user_id=user.id, full_name=full_name))

        # Not fatal to account/project creation - if BREVO_API_KEY is
        # configured and the real send fails, the account (with its temp
        # password already generated) and onboarding project must still be
        # created; otherwise this exception would propagate out of
        # crm_verify and roll back the payment's finance/CRM verification
        # that already genuinely happened. Matches the try/except pattern
        # already used for the other two emails in this workflow
        # (finance/service.py's crm_approve_advance).
        try:
            await EmailService().send_client_portal_welcome_email(
                to_email=lead.email, full_name=full_name, username=user.username,
                temp_password=temp_password, login_url=f"{settings.FRONTEND_URL}/login",
            )
        except EmailDeliveryError:
            await log_activity(
                self._db, user_id=actor_id, entity_type="lead", entity_id=lead.id,
                action="email_failed",
                description=f"Client portal welcome email failed to send to {lead.email}. Username: {user.username}.",
            )

        lead.status = lead_pipeline.CLIENT_ACCOUNT_CREATED
        await self._db.flush()
        project = await self._lead_service.create_onboarding_project(lead, client_id)
        lead.status = lead_pipeline.PROJECT_CREATED
        await self._db.flush()
        await self._db.refresh(lead)

        await log_activity(
            self._db, user_id=actor_id, entity_type="lead", entity_id=lead.id,
            action="client_account_created",
            description=f"Client portal account created for '{lead.title}'; project '{project.name}' created.",
        )
        await notify_role(self._db, "crm", title="Client account created", message=f"Portal account created for '{lead.title}' after advance payment verification.")
        await notify_role(self._db, "sales", title="Client account created", message=f"'{lead.title}' now has a client portal account - deal closed.")

        return user

    async def _unique_username(self, full_name: str) -> str:
        base = re.sub(r"[^a-z0-9_.]", "", full_name.lower().replace(" ", "."))[:40] or "client"
        candidate = base
        suffix = 0
        while await self._user_repo.exists_by_username(candidate):
            suffix += 1
            candidate = f"{base}{suffix}"
        return candidate
