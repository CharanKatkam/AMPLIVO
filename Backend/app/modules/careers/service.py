"""Service for the Careers module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.careers.models import JobOpening, JobApplication
from app.modules.careers.repository import JobOpeningRepository, JobApplicationRepository
from app.modules.careers.schemas import JobOpeningCreate, JobOpeningUpdate, JobApplicationCreate, JobApplicationUpdate
from app.core.exceptions import NotFoundException


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
            raise NotFoundException(detail="Job opening not found")
        return obj

    async def create(self, data: JobOpeningCreate) -> JobOpening:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: JobOpeningUpdate) -> JobOpening:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Job opening not found")
        await self._repo.update(obj, data.model_dump(exclude_unset=True))
        return await self._repo.get_by_id(id)

    async def delete(self, id: uuid.UUID) -> None:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Job opening not found")
        await self._repo.delete(obj.id)

    async def list_applications(self, job_opening_id: uuid.UUID) -> list[JobApplication]:
        return await self._app_repo.get_all()

    async def get_application(self, id: uuid.UUID) -> JobApplication:
        obj = await self._app_repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Job application not found")
        return obj

    async def create_application(self, data: JobApplicationCreate) -> JobApplication:
        return await self._app_repo.create_from_dict(data.model_dump())

    async def update_application(self, id: uuid.UUID, data: JobApplicationUpdate) -> JobApplication:
        obj = await self._app_repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Job application not found")
        await self._app_repo.update(obj, data.model_dump(exclude_unset=True))
        return await self._app_repo.get_by_id(id)
