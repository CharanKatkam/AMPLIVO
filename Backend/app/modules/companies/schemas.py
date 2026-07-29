"""Pydantic schemas for the Companies module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.core.field_types import HttpUrlStr, NameStr, PhoneNumber
from app.core.sanitizers import SanitizedModel


class CompanyBase(SanitizedModel):
    name: NameStr
    registration_number: Optional[str] = Field(None, min_length=1, max_length=100)
    tax_id: Optional[str] = Field(None, min_length=1, max_length=100)
    industry: Optional[str] = Field(None, min_length=1, max_length=200)
    website: HttpUrlStr = None
    email: EmailStr | None = None
    phone: PhoneNumber = None
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    logo_url: HttpUrlStr = None
    status: str = Field(default="active", min_length=1, max_length=50)


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(SanitizedModel):
    name: Optional[NameStr] = None
    registration_number: Optional[str] = Field(None, min_length=1, max_length=100)
    tax_id: Optional[str] = Field(None, min_length=1, max_length=100)
    industry: Optional[str] = Field(None, min_length=1, max_length=200)
    website: HttpUrlStr = None
    email: EmailStr | None = None
    phone: PhoneNumber = None
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    logo_url: HttpUrlStr = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)


class CompanyRead(CompanyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
