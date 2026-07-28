"""Pydantic schemas for Messaging."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel


class ConversationCreate(SanitizedModel):
    subject: NameStr = Field(min_length=1, max_length=500)
    client_id: uuid.UUID | None = None


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    subject: str
    is_closed: bool
    created_at: datetime
    updated_at: datetime


class MessageCreate(SanitizedModel):
    content: str = Field(min_length=1, max_length=10000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID | None
    content: str
    is_read: bool
    created_at: datetime
