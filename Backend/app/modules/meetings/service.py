"""Service layer for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import lead_pipeline
from app.core.exceptions import NotFoundException
from app.modules.leads.models import Lead
from app.modules.meetings.models import Meeting
from app.modules.meetings.repository import MeetingRepository
from app.services.email_service import EmailService
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
        if lead is not None:
            if lead.status == lead_pipeline.NEW_LEAD:
                lead.status = lead_pipeline.MEETING_SCHEDULED
                await self._db.flush()
            if lead.email:
                await EmailService().send_meeting_invite_email(
                    to_email=lead.email, contact_name=lead.contact_name or lead.title,
                    meeting_title=meeting.title, scheduled_at=f"{meeting.scheduled_at:%Y-%m-%d %H:%M}",
                )
        return meeting

    async def update_meeting(self, meeting_id: uuid.UUID, data: dict[str, Any]) -> Meeting:
        updated = await self._repo.update(meeting_id, data)
        if updated is None:
            raise NotFoundException("Meeting")
        return updated

    async def reschedule_meeting(self, meeting_id: uuid.UUID, *, new_time: datetime, reason: str | None, actor_id: uuid.UUID | None) -> Meeting:
        meeting = await self.get_meeting(meeting_id)
        updated = await self._repo.update(meeting_id, {"scheduled_at": new_time, "status": "scheduled"})
        if updated is None:
            raise NotFoundException("Meeting")
        await log_activity(
            self._db, user_id=actor_id, entity_type="lead", entity_id=meeting.lead_id,
            action="meeting_rescheduled",
            description=f"Meeting '{meeting.title}' rescheduled to {new_time:%Y-%m-%d %H:%M}" + (f": {reason}" if reason else ""),
        )
        lead = await self._db.get(Lead, meeting.lead_id)
        if lead is not None and lead.email:
            await EmailService().send_meeting_rescheduled_email(
                to_email=lead.email, contact_name=lead.contact_name or lead.title,
                meeting_title=meeting.title, scheduled_at=f"{new_time:%Y-%m-%d %H:%M}", reason=reason,
            )
        return updated

    async def cancel_meeting(self, meeting_id: uuid.UUID, *, reason: str | None, actor_id: uuid.UUID | None) -> Meeting:
        """Soft cancel (status='cancelled') - the affordance a Sales user
        should use, as opposed to the hard DELETE endpoint which stays for
        admin data cleanup only."""
        meeting = await self.get_meeting(meeting_id)
        updated = await self._repo.update(meeting_id, {"status": "cancelled", "notes": reason})
        if updated is None:
            raise NotFoundException("Meeting")
        await log_activity(
            self._db, user_id=actor_id, entity_type="lead", entity_id=meeting.lead_id,
            action="meeting_cancelled",
            description=f"Meeting '{meeting.title}' cancelled" + (f": {reason}" if reason else ""),
        )
        lead = await self._db.get(Lead, meeting.lead_id)
        if lead is not None and lead.email:
            await EmailService().send_meeting_cancelled_email(
                to_email=lead.email, contact_name=lead.contact_name or lead.title,
                meeting_title=meeting.title, reason=reason,
            )
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
        lead = await self._db.get(Lead, meeting.lead_id)
        if lead is not None and lead.status == lead_pipeline.MEETING_SCHEDULED:
            lead.status = lead_pipeline.MEETING_COMPLETED
            await self._db.flush()
        return updated

    async def delete_meeting(self, meeting_id: uuid.UUID) -> None:
        if not await self._repo.delete(meeting_id):
            raise NotFoundException("Meeting")
