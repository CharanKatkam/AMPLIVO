"""Pydantic schemas for the Testimonials module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TestimonialBase(BaseModel):
    client_id: Optional[uuid.UUID] = None
    client_name: str
    client_title: Optional[str] = None
    content: str
    rating: Optional[int] = None
    avatar_url: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    sort_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    client_id: Optional[uuid.UUID] = None
    client_name: Optional[str] = None
    client_title: Optional[str] = None
    content: Optional[str] = None
    rating: Optional[int] = None
    avatar_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class TestimonialRead(TestimonialBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
