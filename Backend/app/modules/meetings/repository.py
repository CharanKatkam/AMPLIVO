"""Repository layer for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import date
from typing import Sequence
from sqlalchemy import func, select
from app.core.filters import apply_search, apply_sorting
from app.modules.meetings.models import Meeting
from app.repositories.base import BaseRepository


class MeetingRepository(BaseRepository[Meeting]):
    model = Meeting
    searchable_columns = [Meeting.title]

    async def get_all_filtered(self, *, search=None, lead_id=None, status=None,
                               assigned_to=None, on_date: date | None = None,
                               sort_by=None, sort_order="asc", offset=0, limit=20) -> Sequence[Meeting]:
        stmt = select(Meeting)
        if lead_id: stmt = stmt.where(Meeting.lead_id == lead_id)
        if status: stmt = stmt.where(Meeting.status == status)
        if assigned_to: stmt = stmt.where(Meeting.assigned_to == assigned_to)
        if on_date: stmt = stmt.where(func.date(Meeting.scheduled_at) == on_date)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Meeting, sort_by=sort_by or "scheduled_at", sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()

    async def count_filtered(self, *, search=None, lead_id=None, status=None,
                             assigned_to=None, on_date: date | None = None) -> int:
        stmt = select(func.count()).select_from(Meeting)
        if lead_id: stmt = stmt.where(Meeting.lead_id == lead_id)
        if status: stmt = stmt.where(Meeting.status == status)
        if assigned_to: stmt = stmt.where(Meeting.assigned_to == assigned_to)
        if on_date: stmt = stmt.where(func.date(Meeting.scheduled_at) == on_date)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

    async def count_today(self) -> int:
        stmt = select(func.count()).select_from(Meeting).where(func.date(Meeting.scheduled_at) == func.current_date())
        return (await self._db.execute(stmt)).scalar_one()
