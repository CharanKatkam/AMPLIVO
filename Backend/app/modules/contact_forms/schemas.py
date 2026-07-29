"""Pydantic schemas for the Contact Forms module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.core.field_types import NameStr, PhoneNumber
from app.core.sanitizers import SanitizedModel


class ContactSubmissionBase(SanitizedModel):
    name: NameStr
    email: EmailStr
    phone: PhoneNumber | None = None
    company: Optional[NameStr] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=10000)
    source: Optional[str] = Field(None, min_length=1, max_length=200)
    status: str = Field(default="new", min_length=1, max_length=50)
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ContactSubmissionCreate(ContactSubmissionBase):
    pass


class ContactSubmissionUpdate(SanitizedModel):
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    converted_lead_id: Optional[uuid.UUID] = None


class ContactSubmissionRead(ContactSubmissionBase):
    id: uuid.UUID
    converted_lead_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
