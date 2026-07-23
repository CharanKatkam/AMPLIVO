"""Pydantic schemas for the Contact Forms module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ContactSubmissionBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: Optional[str] = None
    message: str
    source: Optional[str] = None
    status: str = "new"
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ContactSubmissionCreate(ContactSubmissionBase):
    pass


class ContactSubmissionUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    converted_lead_id: Optional[uuid.UUID] = None


class ContactSubmissionRead(ContactSubmissionBase):
    id: uuid.UUID
    converted_lead_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
