"""Pydantic schemas for the Influencers module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.field_types import HttpUrlStr, NameStr, PhoneNumber
from app.core.sanitizers import SanitizedModel

# ── Influencer ──
class InfluencerBase(SanitizedModel):
    name: NameStr = Field(min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: PhoneNumber = None
    niche: str | None = Field(None, min_length=1, max_length=200)
    platform: str = Field(min_length=1, max_length=100)
    profile_url: HttpUrlStr = None
    followers_count: int | None = None
    engagement_rate: float | None = None
    status: str = Field(min_length=1, max_length=50)

class InfluencerCreate(InfluencerBase): pass
class InfluencerUpdate(SanitizedModel):
    name: NameStr | None = Field(None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: PhoneNumber = None
    niche: str | None = Field(None, min_length=1, max_length=200)
    platform: str | None = Field(None, min_length=1, max_length=100)
    profile_url: HttpUrlStr = None
    followers_count: int | None = None
    engagement_rate: float | None = None
    status: str | None = Field(None, min_length=1, max_length=50)

class InfluencerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    niche: str | None
    platform: str
    profile_url: str | None
    followers_count: int | None
    engagement_rate: float | None
    status: str
    created_at: datetime
    updated_at: datetime

# ── InfluencerCampaign ──
class InfluencerCampaignBase(SanitizedModel):
    campaign_id: uuid.UUID | None = None
    status: str = Field(min_length=1, max_length=50)
    deliverables: str | None = Field(None, min_length=1, max_length=5000)
    budget: float | None = None
    publish_date: date | None = None

class InfluencerCampaignCreate(InfluencerCampaignBase): pass
class InfluencerCampaignUpdate(SanitizedModel):
    campaign_id: uuid.UUID | None = None
    status: str | None = Field(None, min_length=1, max_length=50)
    deliverables: str | None = Field(None, min_length=1, max_length=5000)
    budget: float | None = None
    publish_date: date | None = None

class InfluencerCampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    influencer_id: uuid.UUID
    campaign_id: uuid.UUID | None
    status: str
    deliverables: str | None
    budget: float | None
    publish_date: date | None
    created_at: datetime
    updated_at: datetime

# ── InfluencerContract ──
class InfluencerContractBase(SanitizedModel):
    campaign_id: uuid.UUID | None = None
    document_url: HttpUrlStr = None
    status: str = Field(min_length=1, max_length=50)
    signed_date: date | None = None
    valid_until: date | None = None

class InfluencerContractCreate(InfluencerContractBase): pass
class InfluencerContractUpdate(SanitizedModel):
    campaign_id: uuid.UUID | None = None
    document_url: HttpUrlStr = None
    status: str | None = Field(None, min_length=1, max_length=50)
    signed_date: date | None = None
    valid_until: date | None = None

class InfluencerContractRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    influencer_id: uuid.UUID
    campaign_id: uuid.UUID | None
    document_url: str | None
    status: str
    signed_date: date | None
    valid_until: date | None
    created_at: datetime
