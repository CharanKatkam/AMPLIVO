"""Pydantic schemas for the CMS module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr, SlugStr
from app.core.sanitizers import SanitizedModel

# ContentCategory
class ContentCategoryBase(SanitizedModel):
    name: NameStr
    slug: SlugStr
    description: str | None = None

class ContentCategoryCreate(ContentCategoryBase): pass
class ContentCategoryUpdate(SanitizedModel):
    name: NameStr | None = None
    slug: SlugStr | None = None
    description: str | None = None

class ContentCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime

# ContentItem
class ContentItemBase(SanitizedModel):
    title: NameStr
    slug: SlugStr
    body: str = Field(min_length=1, max_length=100000)
    excerpt: str | None = None
    status: str = Field(default="draft", min_length=1, max_length=50)
    content_type: str = Field(default="post", min_length=1, max_length=100)
    category_id: uuid.UUID | None = None

class ContentItemCreate(ContentItemBase): pass
class ContentItemUpdate(SanitizedModel):
    title: NameStr | None = None
    slug: SlugStr | None = None
    body: str | None = Field(None, min_length=1, max_length=100000)
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
