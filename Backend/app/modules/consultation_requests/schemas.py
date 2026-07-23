"""Pydantic schemas for the Consultation Requests module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ConsultationRequestBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    service_interest: Optional[str] = None
    budget_range: Optional[str] = None
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None
    status: str = "pending"
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ConsultationRequestCreate(ConsultationRequestBase):
    pass


class ConsultationRequestUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class ConsultationRequestRead(ConsultationRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
