"""Pydantic schemas for the FAQs module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel


class FaqCategoryBase(SanitizedModel):
    name: NameStr
    slug: str = Field(min_length=1, max_length=200)
    sort_order: int = 0
    is_active: bool = True


class FaqCategoryCreate(FaqCategoryBase):
    pass


class FaqCategoryRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FaqBase(SanitizedModel):
    category_id: Optional[uuid.UUID] = None
    question: str = Field(min_length=1, max_length=1000)
    answer: str = Field(min_length=1, max_length=10000)
    sort_order: int = 0
    is_active: bool = True


class FaqCreate(FaqBase):
    pass


class FaqUpdate(SanitizedModel):
    category_id: Optional[uuid.UUID] = None
    question: Optional[str] = Field(None, min_length=1, max_length=1000)
    answer: Optional[str] = Field(None, min_length=1, max_length=10000)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class FaqRead(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[FaqCategoryRead] = None

    model_config = ConfigDict(from_attributes=True)
