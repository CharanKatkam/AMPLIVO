"""Pydantic schemas for the Websites module."""
from __future__ import annotations
import uuid
from datetime import datetime, date as datetime_date
from pydantic import BaseModel, ConfigDict, Field

# ── Website ──
class WebsiteBase(BaseModel):
    client_id: uuid.UUID | None = None
    domain: str = Field(min_length=3, max_length=255)
    name: str = Field(min_length=1, max_length=200)
    platform: str | None = None
    hosting_provider: str | None = None
    status: str = "active"
    manager_id: uuid.UUID | None = None

class WebsiteCreate(WebsiteBase): pass
class WebsiteUpdate(BaseModel):
    client_id: uuid.UUID | None = None
    domain: str | None = Field(None, min_length=3, max_length=255)
    name: str | None = Field(None, min_length=1, max_length=200)
    platform: str | None = None
    hosting_provider: str | None = None
    status: str | None = None
    manager_id: uuid.UUID | None = None

class WebsiteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    domain: str
    name: str
    platform: str | None
    hosting_provider: str | None
    status: str
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── WebsitePage ──
class WebsitePageBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    url_path: str = Field(min_length=1, max_length=500)
    status: str = "published"
    seo_title: str | None = None
    seo_description: str | None = None

class WebsitePageCreate(WebsitePageBase): pass
class WebsitePageUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    url_path: str | None = Field(None, min_length=1, max_length=500)
    status: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None

class WebsitePageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    website_id: uuid.UUID
    title: str
    url_path: str
    status: str
    seo_title: str | None
    seo_description: str | None
    created_at: datetime
    updated_at: datetime

# ── WebsiteMetric ──
class WebsiteMetricBase(BaseModel):
    date: datetime_date
    visitors: int = 0
    page_views: int = 0
    bounce_rate: int | None = None
    avg_session_duration: int | None = None

class WebsiteMetricCreate(WebsiteMetricBase): pass
class WebsiteMetricUpdate(BaseModel):
    date: datetime_date | None = None
    visitors: int | None = None
    page_views: int | None = None
    bounce_rate: int | None = None
    avg_session_duration: int | None = None

class WebsiteMetricRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    website_id: uuid.UUID
    date: datetime_date
    visitors: int
    page_views: int
    bounce_rate: int | None
    avg_session_duration: int | None
    created_at: datetime
