"""Pydantic schemas for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel


class MeetingCreate(SanitizedModel):
    lead_id: uuid.UUID
    title: NameStr = Field(min_length=2, max_length=300)
    meeting_type: str = Field(min_length=1, max_length=100)
    scheduled_at: datetime
    duration_minutes: int = 30
    agenda: str | None = Field(None, min_length=1, max_length=5000)
    assigned_to: uuid.UUID | None = None


class MeetingUpdate(SanitizedModel):
    title: NameStr | None = Field(None, min_length=2, max_length=300)
    meeting_type: str | None = Field(None, min_length=1, max_length=100)
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    status: str | None = Field(None, min_length=1, max_length=50)
    agenda: str | None = Field(None, min_length=1, max_length=5000)
    notes: str | None = Field(None, min_length=1, max_length=5000)
    follow_up_required: bool | None = None
    assigned_to: uuid.UUID | None = None


class MeetingCompleteRequest(SanitizedModel):
    notes: str | None = Field(None, min_length=1, max_length=5000)
    follow_up_required: bool = False


class MeetingRescheduleRequest(SanitizedModel):
    scheduled_at: datetime
    reason: str | None = Field(None, min_length=1, max_length=2000)


class MeetingCancelRequest(SanitizedModel):
    reason: str | None = Field(None, min_length=1, max_length=2000)


class MeetingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    lead_id: uuid.UUID
    title: str
    meeting_type: str
    scheduled_at: datetime
    duration_minutes: int
    status: str
    agenda: str | None
    notes: str | None
    follow_up_required: bool
    assigned_to: uuid.UUID | None
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
