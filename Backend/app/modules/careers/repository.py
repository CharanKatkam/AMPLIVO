"""Repository for the Careers module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.careers.models import JobOpening, JobApplication


class JobOpeningRepository(BaseRepository[JobOpening]):
    model = JobOpening

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class JobApplicationRepository(BaseRepository[JobApplication]):
    model = JobApplication

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
