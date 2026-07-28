"""Pydantic schemas for the Testimonials module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import SanitizedModel
from app.core.field_types import HttpUrlStr, NameStr


class TestimonialBase(SanitizedModel):
    client_id: Optional[uuid.UUID] = None
    client_name: NameStr
    client_title: Optional[NameStr] = None
    content: str = Field(min_length=1)
    rating: Optional[int] = None
    avatar_url: Optional[HttpUrlStr] = None
    is_featured: bool = False
    is_active: bool = True
    sort_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(SanitizedModel):
    client_id: Optional[uuid.UUID] = None
    client_name: Optional[NameStr] = None
    client_title: Optional[NameStr] = None
    content: Optional[str] = Field(None, min_length=1)
    rating: Optional[int] = None
    avatar_url: Optional[HttpUrlStr] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class TestimonialRead(TestimonialBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
