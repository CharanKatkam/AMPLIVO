"""Pydantic schemas for Support Tickets."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SupportTicketCreate(BaseModel):
    subject: str = Field(min_length=2, max_length=300)
    description: str = Field(min_length=1)
    category: str = "general"
    priority: str = "medium"
    client_id: uuid.UUID | None = None


class SupportTicketUpdate(BaseModel):
    subject: str | None = Field(None, min_length=2, max_length=300)
    description: str | None = None
    category: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: uuid.UUID | None = None


class SupportTicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_by: uuid.UUID | None
    assigned_to: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class SupportTicketCommentCreate(BaseModel):
    content: str = Field(min_length=1)


class SupportTicketCommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    ticket_id: uuid.UUID
    user_id: uuid.UUID | None
    content: str
    created_at: datetime
