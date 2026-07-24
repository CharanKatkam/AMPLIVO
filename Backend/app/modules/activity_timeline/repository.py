"""Repository for the Activity Timeline module."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.activity_timeline.models import ActivityLog


class ActivityLogRepository(BaseRepository[ActivityLog]):
    model = ActivityLog

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_all_filtered(self, *, entity_type: str | None = None, entity_id: uuid.UUID | None = None,
                               offset: int = 0, limit: int = 100) -> list[ActivityLog]:
        stmt = select(ActivityLog)
        if entity_type: stmt = stmt.where(ActivityLog.entity_type == entity_type)
        if entity_id: stmt = stmt.where(ActivityLog.entity_id == entity_id)
        stmt = stmt.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
