"""Pydantic schemas for the Influencers module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr

# ── Influencer ──
class InfluencerBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    niche: str | None = None
    platform: str = Field(min_length=1, max_length=100)
    profile_url: str | None = None
    followers_count: int | None = None
    engagement_rate: float | None = None
    status: str = "active"

class InfluencerCreate(InfluencerBase): pass
class InfluencerUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    niche: str | None = None
    platform: str | None = Field(None, min_length=1, max_length=100)
    profile_url: str | None = None
    followers_count: int | None = None
    engagement_rate: float | None = None
    status: str | None = None

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
class InfluencerCampaignBase(BaseModel):
    campaign_id: uuid.UUID | None = None
    status: str = "negotiation"
    deliverables: str | None = None
    budget: float | None = None
    publish_date: date | None = None

class InfluencerCampaignCreate(InfluencerCampaignBase): pass
class InfluencerCampaignUpdate(BaseModel):
    campaign_id: uuid.UUID | None = None
    status: str | None = None
    deliverables: str | None = None
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
class InfluencerContractBase(BaseModel):
    campaign_id: uuid.UUID | None = None
    document_url: str | None = None
    status: str = "draft"
    signed_date: date | None = None
    valid_until: date | None = None

class InfluencerContractCreate(InfluencerContractBase): pass
class InfluencerContractUpdate(BaseModel):
    campaign_id: uuid.UUID | None = None
    document_url: str | None = None
    status: str | None = None
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
