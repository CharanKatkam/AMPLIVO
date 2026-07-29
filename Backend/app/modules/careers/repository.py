"""Repository for the Careers module."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.careers.models import Interview, JobApplication, JobOpening, Offer


class JobOpeningRepository(BaseRepository[JobOpening]):
    model = JobOpening

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class JobApplicationRepository(BaseRepository[JobApplication]):
    model = JobApplication

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_by_job(self, job_opening_id: uuid.UUID) -> Sequence[JobApplication]:
        r = await self._db.execute(
            select(JobApplication).where(JobApplication.job_opening_id == job_opening_id).order_by(JobApplication.created_at.desc())
        )
        return r.scalars().all()

    async def get_all_filtered(self, *, job_opening_id=None, status=None, offset=0, limit=100) -> Sequence[JobApplication]:
        stmt = select(JobApplication)
        if job_opening_id: stmt = stmt.where(JobApplication.job_opening_id == job_opening_id)
        if status: stmt = stmt.where(JobApplication.status == status)
        stmt = stmt.order_by(JobApplication.created_at.desc()).offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()


class InterviewRepository(BaseRepository[Interview]):
    model = Interview

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_by_application(self, application_id: uuid.UUID) -> Sequence[Interview]:
        r = await self._db.execute(
            select(Interview).where(Interview.application_id == application_id).order_by(Interview.scheduled_at.desc())
        )
        return r.scalars().all()


class OfferRepository(BaseRepository[Offer]):
    model = Offer

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_by_application(self, application_id: uuid.UUID) -> Sequence[Offer]:
        r = await self._db.execute(
            select(Offer).where(Offer.application_id == application_id).order_by(Offer.created_at.desc())
        )
        return r.scalars().all()
