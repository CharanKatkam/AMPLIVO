"""Service layer for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import date
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.modules.leads.models import Lead
from app.modules.meetings.models import Meeting
from app.modules.meetings.repository import MeetingRepository
from app.utils.sales_events import log_activity, notify_users


class MeetingService:
    def __init__(self, db: AsyncSession, repo: MeetingRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_meetings(self, *, search=None, lead_id=None, status=None, assigned_to=None,
                            on_date: date | None = None, sort_by=None, sort_order="asc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(
            search=search, lead_id=lead_id, status=status, assigned_to=assigned_to, on_date=on_date,
            sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit,
        )
        total = await self._repo.count_filtered(search=search, lead_id=lead_id, status=status, assigned_to=assigned_to, on_date=on_date)
        return items, total

    async def get_meeting(self, meeting_id: uuid.UUID) -> Meeting:
        m = await self._repo.get_by_id(meeting_id)
        if m is None:
            raise NotFoundException("Meeting")
        return m

    async def create_meeting(self, data: dict[str, Any], created_by: uuid.UUID | None) -> Meeting:
        data["created_by"] = created_by
        meeting = await self._repo.create_from_dict(data)

        lead = await self._db.get(Lead, meeting.lead_id)
        notify_ids = [meeting.assigned_to, created_by, lead.assigned_to if lead else None]
        await notify_users(
            self._db, notify_ids,
            title="Meeting scheduled",
            message=f"{meeting.title} scheduled for {meeting.scheduled_at:%Y-%m-%d %H:%M}"
            + (f" with {lead.company_name or lead.title}" if lead else ""),
        )
        await log_activity(
            self._db, user_id=created_by, entity_type="lead", entity_id=meeting.lead_id,
            action="meeting_scheduled",
            description=f"Meeting '{meeting.title}' scheduled for {meeting.scheduled_at:%Y-%m-%d %H:%M}",
        )
        return meeting

    async def update_meeting(self, meeting_id: uuid.UUID, data: dict[str, Any]) -> Meeting:
        updated = await self._repo.update(meeting_id, data)
        if updated is None:
            raise NotFoundException("Meeting")
        return updated

    async def complete_meeting(self, meeting_id: uuid.UUID, *, notes: str | None, follow_up_required: bool, actor_id: uuid.UUID | None) -> Meeting:
        meeting = await self.get_meeting(meeting_id)
        updated = await self._repo.update(
            meeting_id, {"status": "completed", "notes": notes, "follow_up_required": follow_up_required}
        )
        if updated is None:
            raise NotFoundException("Meeting")
        await log_activity(
            self._db, user_id=actor_id, entity_type="lead", entity_id=meeting.lead_id,
            action="meeting_completed",
            description=f"Meeting '{meeting.title}' marked completed" + (" - follow-up required" if follow_up_required else ""),
        )
        return updated

    async def delete_meeting(self, meeting_id: uuid.UUID) -> None:
        if not await self._repo.delete(meeting_id):
            raise NotFoundException("Meeting")
