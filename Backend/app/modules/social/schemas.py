"""Pydantic schemas for the Social module."""
from __future__ import annotations
import uuid
from datetime import datetime, date as datetime_date
from pydantic import BaseModel, ConfigDict, Field

# ── SocialProfile ──
class SocialProfileBase(BaseModel):
    client_id: uuid.UUID | None = None
    platform: str = Field(min_length=1, max_length=50)
    profile_name: str = Field(min_length=1, max_length=200)
    profile_url: str | None = None
    access_token: str | None = None
    status: str = "active"

class SocialProfileCreate(SocialProfileBase): pass
class SocialProfileUpdate(BaseModel):
    client_id: uuid.UUID | None = None
    platform: str | None = Field(None, min_length=1, max_length=50)
    profile_name: str | None = Field(None, min_length=1, max_length=200)
    profile_url: str | None = None
    access_token: str | None = None
    status: str | None = None

class SocialProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    platform: str
    profile_name: str
    profile_url: str | None
    status: str
    created_at: datetime
    updated_at: datetime

# ── SocialPost ──
class SocialPostBase(BaseModel):
    content: str = Field(min_length=1)
    media_urls: str | None = None
    scheduled_at: datetime | None = None
    published_at: datetime | None = None
    status: str = "draft"

class SocialPostCreate(SocialPostBase): pass
class SocialPostUpdate(BaseModel):
    content: str | None = Field(None, min_length=1)
    media_urls: str | None = None
    scheduled_at: datetime | None = None
    published_at: datetime | None = None
    status: str | None = None

class SocialPostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    profile_id: uuid.UUID
    content: str
    media_urls: str | None
    scheduled_at: datetime | None
    published_at: datetime | None
    status: str
    author_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── SocialMetric ──
class SocialMetricBase(BaseModel):
    date: datetime_date
    likes: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    impressions: int = 0

class SocialMetricCreate(SocialMetricBase): pass
class SocialMetricUpdate(BaseModel):
    date: datetime_date | None = None
    likes: int | None = None
    comments: int | None = None
    shares: int | None = None
    clicks: int | None = None
    impressions: int | None = None

class SocialMetricRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    post_id: uuid.UUID
    date: datetime_date
    likes: int
    comments: int
    shares: int
    clicks: int
    impressions: int
    created_at: datetime
