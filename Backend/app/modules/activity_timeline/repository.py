"""Repository for the Activity Timeline module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.activity_timeline.models import ActivityLog


class ActivityLogRepository(BaseRepository[ActivityLog]):
    model = ActivityLog

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
