"""Pydantic schemas for the CMS module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── ContentCategory ──
class ContentCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    description: str | None = None

class ContentCategoryCreate(ContentCategoryBase): pass
class ContentCategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    slug: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None

class ContentCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime

# ── ContentItem ──
class ContentItemBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1)
    excerpt: str | None = None
    status: str = "draft"
    content_type: str = "post"
    category_id: uuid.UUID | None = None

class ContentItemCreate(ContentItemBase): pass
class ContentItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    slug: str | None = Field(None, min_length=1, max_length=200)
    body: str | None = Field(None, min_length=1)
    excerpt: str | None = None
    status: str | None = None
    content_type: str | None = None
    category_id: uuid.UUID | None = None

class ContentItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    slug: str
    body: str
    excerpt: str | None
    status: str
    content_type: str
    category_id: uuid.UUID | None
    author_id: uuid.UUID | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
