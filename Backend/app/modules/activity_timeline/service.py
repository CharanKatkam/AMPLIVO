"""Service for the Activity Timeline module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.activity_timeline.models import ActivityLog
from app.modules.activity_timeline.repository import ActivityLogRepository
from app.modules.activity_timeline.schemas import ActivityLogCreate
from app.core.exceptions import NotFoundException


class ActivityLogService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ActivityLogRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ActivityLog]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ActivityLog:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("ActivityLog")
        return obj

    async def create(self, data: ActivityLogCreate) -> ActivityLog:
        return await self._repo.create_from_dict(data.model_dump())

    async def delete(self, id: uuid.UUID) -> None:
        if not await self._repo.delete(id):
            raise NotFoundException("ActivityLog")
