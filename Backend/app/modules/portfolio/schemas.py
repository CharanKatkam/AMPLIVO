"""Pydantic schemas for the Portfolio module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PortfolioItemBase(BaseModel):
    title: str
    slug: str
    client_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cover_image_url: Optional[str] = None
    live_url: Optional[str] = None
    technologies: Optional[str] = None
    status: str = "draft"
    sort_order: int = 0
    author_id: Optional[uuid.UUID] = None


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    client_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cover_image_url: Optional[str] = None
    live_url: Optional[str] = None
    technologies: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


class PortfolioItemRead(PortfolioItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
