"""Repository for the Content Calendar module."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.content_calendar.models import ContentCalendarEntry


class ContentCalendarEntryRepository(BaseRepository[ContentCalendarEntry]):
    model = ContentCalendarEntry

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_all_filtered(self, *, client_id: uuid.UUID | None = None, offset: int = 0, limit: int = 100) -> Sequence[ContentCalendarEntry]:
        stmt = select(ContentCalendarEntry)
        if client_id:
            stmt = stmt.where(ContentCalendarEntry.client_id == client_id)
        stmt = stmt.order_by(ContentCalendarEntry.scheduled_date).offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()
