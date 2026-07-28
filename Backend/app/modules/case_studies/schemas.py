"""Pydantic schemas for the Case Studies module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import HttpUrlStr, NameStr, SlugStr
from app.core.sanitizers import SanitizedModel


class CaseStudyMetricBase(SanitizedModel):
    label: NameStr
    value: str = Field(min_length=1, max_length=500)
    sort_order: int = 0


class CaseStudyMetricCreate(CaseStudyMetricBase):
    pass


class CaseStudyMetricRead(CaseStudyMetricBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class CaseStudyBase(SanitizedModel):
    title: NameStr
    slug: SlugStr
    client_id: Optional[uuid.UUID] = None
    industry: Optional[str] = Field(None, min_length=1, max_length=200)
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    cover_image_url: HttpUrlStr = None
    status: str = Field(default="draft", min_length=1, max_length=50)
    published_at: Optional[datetime] = None
    author_id: Optional[uuid.UUID] = None


class CaseStudyCreate(CaseStudyBase):
    metrics: list[CaseStudyMetricCreate] = []


class CaseStudyUpdate(SanitizedModel):
    title: Optional[NameStr] = None
    slug: Optional[SlugStr] = None
    client_id: Optional[uuid.UUID] = None
    industry: Optional[str] = Field(None, min_length=1, max_length=200)
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    cover_image_url: HttpUrlStr = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    published_at: Optional[datetime] = None


class CaseStudyRead(CaseStudyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    metrics: list[CaseStudyMetricRead] = []

    model_config = ConfigDict(from_attributes=True)
