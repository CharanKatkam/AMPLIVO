"""Pydantic schemas for the Consultation Requests module."""
from __future__ import annotations

import re
import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

_STRIPPED_FIELDS = (
    "name",
    "phone",
    "company",
    "service_interest",
    "budget_range",
    "preferred_time",
    "message",
    "notes",
)


class ConsultationRequestBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=32)
    company: Optional[str] = Field(None, max_length=200)
    service_interest: Optional[str] = Field(None, max_length=100)
    budget_range: Optional[str] = Field(None, max_length=100)
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = Field(None, max_length=50)
    message: Optional[str] = Field(None, max_length=2000)
    status: str = "pending"
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = Field(None, max_length=5000)

    @field_validator(*_STRIPPED_FIELDS, mode="before")
    @classmethod
    def _strip_control_chars_and_whitespace(cls, v: object) -> object:
        if isinstance(v, str):
            return _CONTROL_CHARS_RE.sub("", v).strip()
        return v


class ConsultationRequestCreate(ConsultationRequestBase):
    pass


class ConsultationRequestUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ConsultationRequestRead(ConsultationRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
