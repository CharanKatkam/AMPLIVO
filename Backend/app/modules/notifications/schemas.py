"""Pydantic schemas for the Notifications module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel

# ── NotificationTemplate ──
class NotificationTemplateBase(SanitizedModel):
    name: NameStr = Field(min_length=1, max_length=200)
    channel: str = Field(min_length=1, max_length=50)
    subject: NameStr | None = None
    body: str = Field(min_length=1, max_length=10000)

class NotificationTemplateCreate(NotificationTemplateBase): pass
class NotificationTemplateUpdate(SanitizedModel):
    name: NameStr | None = Field(None, min_length=1, max_length=200)
    channel: str | None = Field(None, min_length=1, max_length=50)
    subject: NameStr | None = None
    body: str | None = Field(None, min_length=1, max_length=10000)

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
class NotificationBase(SanitizedModel):
    user_id: uuid.UUID
    template_id: uuid.UUID | None = None
    channel: str = Field(min_length=1, max_length=50)
    title: NameStr = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=10000)
    status: str = Field(min_length=1, max_length=50)

class NotificationCreate(NotificationBase): pass
class NotificationUpdate(SanitizedModel):
    is_read: bool | None = None
    status: str | None = Field(None, min_length=1, max_length=50)

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
