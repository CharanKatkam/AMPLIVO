"""Pydantic schemas for the Content Calendar module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import SanitizedModel


class ContentCalendarEntryBase(SanitizedModel):
    title: str = Field(min_length=1, max_length=200)
    content_type: str = Field(min_length=1, max_length=100)
    platform: Optional[str] = Field(None, min_length=1, max_length=100)
    client_id: Optional[uuid.UUID] = None
    campaign_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[date] = None
    publish_date: Optional[date] = None
    status: str = Field(default="draft", min_length=1, max_length=50)
    content_brief: Optional[str] = None
    media_urls: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class ContentCalendarEntryCreate(ContentCalendarEntryBase):
    pass


class ContentCalendarEntryUpdate(SanitizedModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content_type: Optional[str] = Field(None, min_length=1, max_length=100)
    platform: Optional[str] = Field(None, min_length=1, max_length=100)
    client_id: Optional[uuid.UUID] = None
    campaign_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[date] = None
    publish_date: Optional[date] = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    content_brief: Optional[str] = None
    media_urls: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class ContentCalendarEntryRead(ContentCalendarEntryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
