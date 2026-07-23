"""Pydantic schemas for the Notifications module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── NotificationTemplate ──
class NotificationTemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    channel: str = Field(min_length=1, max_length=50)
    subject: str | None = None
    body: str = Field(min_length=1)

class NotificationTemplateCreate(NotificationTemplateBase): pass
class NotificationTemplateUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    channel: str | None = Field(None, min_length=1, max_length=50)
    subject: str | None = None
    body: str | None = Field(None, min_length=1)

class NotificationTemplateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    channel: str
    subject: str | None
    body: str
    created_at: datetime
    updated_at: datetime

# ── Notification ──
class NotificationBase(BaseModel):
    user_id: uuid.UUID
    template_id: uuid.UUID | None = None
    channel: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1)
    status: str = "sent"

class NotificationCreate(NotificationBase): pass
class NotificationUpdate(BaseModel):
    is_read: bool | None = None
    status: str | None = None

class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    template_id: uuid.UUID | None
    channel: str
    title: str
    message: str
    is_read: bool
    read_at: datetime | None
    status: str
    created_at: datetime
