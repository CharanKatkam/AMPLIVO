"""Pydantic schemas for the Content Calendar module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ContentCalendarEntryBase(BaseModel):
    title: str
    content_type: str
    platform: Optional[str] = None
    client_id: Optional[uuid.UUID] = None
    campaign_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[date] = None
    publish_date: Optional[date] = None
    status: str = "draft"
    content_brief: Optional[str] = None
    media_urls: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class ContentCalendarEntryCreate(ContentCalendarEntryBase):
    pass


class ContentCalendarEntryUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[str] = None
    platform: Optional[str] = None
    client_id: Optional[uuid.UUID] = None
    campaign_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[date] = None
    publish_date: Optional[date] = None
    status: Optional[str] = None
    content_brief: Optional[str] = None
    media_urls: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class ContentCalendarEntryRead(ContentCalendarEntryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
