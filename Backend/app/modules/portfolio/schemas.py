"""Pydantic schemas for the Portfolio module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import SanitizedModel
from app.core.field_types import HttpUrlStr, NameStr, SlugStr


class PortfolioItemBase(SanitizedModel):
    title: NameStr
    slug: SlugStr
    client_id: Optional[uuid.UUID] = None
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[NameStr] = None
    cover_image_url: Optional[HttpUrlStr] = None
    live_url: Optional[HttpUrlStr] = None
    technologies: Optional[str] = Field(None, max_length=500)
    status: str = Field("draft", min_length=1, max_length=50)
    sort_order: int = 0
    author_id: Optional[uuid.UUID] = None


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(SanitizedModel):
    title: Optional[NameStr] = None
    slug: Optional[SlugStr] = None
    client_id: Optional[uuid.UUID] = None
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[NameStr] = None
    cover_image_url: Optional[HttpUrlStr] = None
    live_url: Optional[HttpUrlStr] = None
    technologies: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    sort_order: Optional[int] = None


class PortfolioItemRead(PortfolioItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
