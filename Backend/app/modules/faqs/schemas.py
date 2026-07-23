"""Pydantic schemas for the FAQs module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FaqCategoryBase(BaseModel):
    name: str
    slug: str
    sort_order: int = 0
    is_active: bool = True


class FaqCategoryCreate(FaqCategoryBase):
    pass


class FaqCategoryRead(FaqCategoryBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class FaqBase(BaseModel):
    category_id: Optional[uuid.UUID] = None
    question: str
    answer: str
    sort_order: int = 0
    is_active: bool = True


class FaqCreate(FaqBase):
    pass


class FaqUpdate(BaseModel):
    category_id: Optional[uuid.UUID] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class FaqRead(FaqBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: Optional[FaqCategoryRead] = None

    model_config = {"from_attributes": True}
