"""Pydantic schemas for the Consultation Requests module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.core.field_types import NameStr, PhoneNumber
from app.core.sanitizers import SanitizedModel


class ConsultationRequestBase(SanitizedModel):
    name: NameStr
    email: EmailStr
    phone: PhoneNumber | None = None
    company: Optional[NameStr] = None
    service_interest: Optional[str] = Field(None, max_length=200)
    budget_range: Optional[str] = Field(None, max_length=100)
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = Field(None, max_length=20)
    message: Optional[str] = None
    status: str = Field(default="pending", max_length=50)
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ConsultationRequestCreate(ConsultationRequestBase):
    pass


class ConsultationRequestUpdate(SanitizedModel):
    status: Optional[str] = Field(None, max_length=50)
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ConsultationRequestRead(ConsultationRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
