"""Service for the Careers module."""
from __future__ import annotations

import secrets
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.careers.models import Interview, JobApplication, JobOpening, Offer
from app.modules.careers.repository import InterviewRepository, JobApplicationRepository, JobOpeningRepository, OfferRepository
from app.modules.careers.schemas import (
    InterviewCompleteRequest, InterviewCreate, InterviewUpdate, JobApplicationCreate, JobApplicationUpdate,
    JobOpeningCreate, JobOpeningUpdate, OfferCreate, OfferUpdate,
)
from app.modules.users.models import Role
from app.repositories.user_repository import UserRepository
from app.utils.password import hash_password
from app.utils.sales_events import log_activity, notify_role


class JobOpeningService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = JobOpeningRepository(session)
        self._app_repo = JobApplicationRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[JobOpening]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> JobOpening:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Job opening")
        return obj

    async def create(self, data: JobOpeningCreate) -> JobOpening:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: JobOpeningUpdate) -> JobOpening:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Job opening")
        await self._repo.update(id, data.model_dump(exclude_unset=True))
        return await self._repo.get_by_id(id)

    async def delete(self, id: uuid.UUID) -> None:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Job opening")
        await self._repo.delete(obj.id)

    async def list_applications(self, job_opening_id: uuid.UUID, *, status: str | None = None) -> list[JobApplication]:
        return await self._app_repo.get_all_filtered(job_opening_id=job_opening_id, status=status)

    async def list_all_applications(self, *, job_opening_id: uuid.UUID | None = None, status: str | None = None,
                                    offset: int = 0, limit: int = 100) -> list[JobApplication]:
        return await self._app_repo.get_all_filtered(job_opening_id=job_opening_id, status=status, offset=offset, limit=limit)

    async def get_application(self, id: uuid.UUID) -> JobApplication:
        obj = await self._app_repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Job application")
        return obj

    async def create_application(self, data: JobApplicationCreate) -> JobApplication:
        application = await self._app_repo.create_from_dict(data.model_dump())
        job = await self._repo.get_by_id(application.job_opening_id)
        await log_activity(
            self._session, user_id=None, entity_type="job_application", entity_id=application.id,
            action="application_submitted",
            description=f"{application.applicant_name} applied for '{job.title if job else 'a job opening'}'.",
        )
        await notify_role(
            self._session, "hr",
            title="New application received",
            message=f"{application.applicant_name} applied for '{job.title if job else 'a job opening'}'.",
        )
        return application

    async def update_application(self, id: uuid.UUID, data: JobApplicationUpdate, *, actor_id: uuid.UUID | None = None) -> JobApplication:
        obj = await self._app_repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Job application")
        old_status = obj.status
        await self._app_repo.update(id, data.model_dump(exclude_unset=True))
        updated = await self._app_repo.get_by_id(id)
        new_status = data.status
        if new_status and new_status != old_status:
            await log_activity(
                self._session, user_id=actor_id, entity_type="job_application", entity_id=id,
                action="status_changed",
                description=f"{updated.applicant_name}'s status changed from '{old_status}' to '{new_status}'.",
            )
        return updated


class InterviewService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = InterviewRepository(session)
        self._app_repo = JobApplicationRepository(session)

    async def list_for_application(self, application_id: uuid.UUID) -> list[Interview]:
        return await self._repo.list_by_application(application_id)

    async def list_all(self, *, offset: int = 0, limit: int = 200) -> list[Interview]:
        return await self._repo.get_all(offset=offset, limit=limit, sort_by="scheduled_at", sort_order="desc")

    async def get(self, id: uuid.UUID) -> Interview:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Interview")
        return obj

    async def schedule(self, application_id: uuid.UUID, data: InterviewCreate, *, created_by: uuid.UUID | None) -> Interview:
        application = await self._app_repo.get_by_id(application_id)
        if not application:
            raise NotFoundException(resource="Job application")
        payload = data.model_dump()
        payload["application_id"] = application_id
        payload["created_by"] = created_by
        interview = await self._repo.create_from_dict(payload)

        await self._app_repo.update(application_id, {"status": "interviewing"})
        await log_activity(
            self._session, user_id=created_by, entity_type="job_application", entity_id=application_id,
            action="interview_scheduled",
            description=f"Interview scheduled for {application.applicant_name} on {interview.scheduled_at:%Y-%m-%d %H:%M}.",
        )
        await notify_role(
            self._session, "hr",
            title="Interview scheduled",
            message=f"Interview scheduled for {application.applicant_name} on {interview.scheduled_at:%Y-%m-%d %H:%M}.",
        )
        return interview

    async def update(self, id: uuid.UUID, data: InterviewUpdate) -> Interview:
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException(resource="Interview")
        return updated

    async def complete(self, id: uuid.UUID, data: InterviewCompleteRequest, *, actor_id: uuid.UUID | None) -> Interview:
        interview = await self.get(id)
        updated = await self._repo.update(
            id, {"status": "completed", "feedback": data.feedback, "recommendation": data.recommendation}
        )
        application = await self._app_repo.get_by_id(interview.application_id)
        await log_activity(
            self._session, user_id=actor_id, entity_type="job_application", entity_id=interview.application_id,
            action="interview_completed",
            description=f"Interview completed for {application.applicant_name if application else 'candidate'}"
            + (f" - recommendation: {data.recommendation}" if data.recommendation else ""),
        )
        return updated


class OfferService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = OfferRepository(session)
        self._app_repo = JobApplicationRepository(session)
        self._job_repo = JobOpeningRepository(session)

    async def list_for_application(self, application_id: uuid.UUID) -> list[Offer]:
        return await self._repo.list_by_application(application_id)

    async def list_all(self, *, offset: int = 0, limit: int = 200) -> list[Offer]:
        return await self._repo.get_all(offset=offset, limit=limit)

    async def get(self, id: uuid.UUID) -> Offer:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(resource="Offer")
        return obj

    async def generate(self, application_id: uuid.UUID, data: OfferCreate, *, created_by: uuid.UUID | None) -> Offer:
        application = await self._app_repo.get_by_id(application_id)
        if not application:
            raise NotFoundException(resource="Job application")
        payload = data.model_dump()
        payload["application_id"] = application_id
        payload["created_by"] = created_by
        offer = await self._repo.create_from_dict(payload)

        await self._app_repo.update(application_id, {"status": "offered"})
        await log_activity(
            self._session, user_id=created_by, entity_type="job_application", entity_id=application_id,
            action="offer_generated", description=f"Offer generated for {application.applicant_name}.",
        )
        await notify_role(self._session, "hr", title="Offer generated", message=f"Offer generated for {application.applicant_name}.")
        return offer

    async def update(self, id: uuid.UUID, data: OfferUpdate) -> Offer:
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException(resource="Offer")
        return updated

    async def update_status(self, id: uuid.UUID, status: str, *, actor_id: uuid.UUID | None) -> Offer:
        offer = await self.get(id)
        updated = await self._repo.update(id, {"status": status})
        application = await self._app_repo.get_by_id(offer.application_id)

        if status == "sent":
            await notify_role(self._session, "hr", title="Offer sent", message=f"Offer sent to {application.applicant_name if application else 'candidate'}.")
        await log_activity(
            self._session, user_id=actor_id, entity_type="job_application",
            entity_id=offer.application_id, action=f"offer_{status}",
            description=f"Offer for {application.applicant_name if application else 'candidate'} marked '{status}'.",
        )
        return updated

    async def accept_and_hire(self, id: uuid.UUID, *, actor_id: uuid.UUID | None) -> tuple[Offer, uuid.UUID | None]:
        """Offer accepted -> hire workflow: create a real employee User account,
        mirroring the Sales module's convert_lead -> Client+Project handoff."""
        offer = await self.get(id)
        if offer.status == "accepted":
            raise BadRequestException("Offer has already been accepted.")
        application = await self._app_repo.get_by_id(offer.application_id)
        if application is None:
            raise NotFoundException(resource="Job application")

        updated_offer = await self._repo.update(id, {"status": "accepted"})
        await self._app_repo.update(offer.application_id, {"status": "hired"})

        user_repo = UserRepository(self._session)
        new_user_id: uuid.UUID | None = None
        if not await user_repo.exists_by_email(application.applicant_email):
            job = await self._job_repo.get_by_id(application.job_opening_id)
            employee_role_id = await self._session.scalar(select(Role.id).where(Role.slug == "employee"))
            base_username = application.applicant_email.split("@")[0].lower()
            username = base_username
            suffix = 1
            while await user_repo.exists_by_username(username):
                suffix += 1
                username = f"{base_username}{suffix}"
            new_user = await user_repo.create(
                email=application.applicant_email,
                username=username,
                full_name=application.applicant_name,
                hashed_password=hash_password(secrets.token_urlsafe(18)),
            )
            new_user.is_verified = True
            new_user.role_id = employee_role_id
            new_user.department_id = job.department_id if job else None
            await self._session.flush()
            new_user_id = new_user.id

        await log_activity(
            self._session, user_id=actor_id, entity_type="job_application", entity_id=offer.application_id,
            action="candidate_hired",
            description=f"{application.applicant_name} accepted the offer and was hired."
            + (" Employee account created." if new_user_id else " (account already existed)."),
        )
        await notify_role(self._session, "admin", title="New hire - handoff ready", message=f"{application.applicant_name} accepted the offer and was hired.")
        await notify_role(self._session, "hr", title="Candidate hired", message=f"{application.applicant_name} accepted the offer.")
        return updated_offer, new_user_id
