"""Pydantic schemas for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MeetingCreate(BaseModel):
    lead_id: uuid.UUID
    title: str = Field(min_length=2, max_length=300)
    meeting_type: str = "video_call"
    scheduled_at: datetime
    duration_minutes: int = 30
    agenda: str | None = None
    assigned_to: uuid.UUID | None = None


class MeetingUpdate(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=300)
    meeting_type: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    status: str | None = None
    agenda: str | None = None
    notes: str | None = None
    follow_up_required: bool | None = None
    assigned_to: uuid.UUID | None = None


class MeetingCompleteRequest(BaseModel):
    notes: str | None = None
    follow_up_required: bool = False


class MeetingRescheduleRequest(BaseModel):
    scheduled_at: datetime
    reason: str | None = None


class MeetingCancelRequest(BaseModel):
    reason: str | None = None


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
