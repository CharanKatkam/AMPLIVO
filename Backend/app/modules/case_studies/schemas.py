"""Pydantic schemas for the Case Studies module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CaseStudyMetricBase(BaseModel):
    label: str
    value: str
    sort_order: int = 0


class CaseStudyMetricCreate(CaseStudyMetricBase):
    pass


class CaseStudyMetricRead(CaseStudyMetricBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}


class CaseStudyBase(BaseModel):
    title: str
    slug: str
    client_id: Optional[uuid.UUID] = None
    industry: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str = "draft"
    published_at: Optional[datetime] = None
    author_id: Optional[uuid.UUID] = None


class CaseStudyCreate(CaseStudyBase):
    metrics: list[CaseStudyMetricCreate] = []


class CaseStudyUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    client_id: Optional[uuid.UUID] = None
    industry: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: Optional[str] = None
    published_at: Optional[datetime] = None


class CaseStudyRead(CaseStudyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    metrics: list[CaseStudyMetricRead] = []

    model_config = {"from_attributes": True}
