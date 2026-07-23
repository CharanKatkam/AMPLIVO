"""Pydantic schemas for the Paid Ads module."""
from __future__ import annotations
import uuid
from datetime import datetime, date as datetime_date
from pydantic import BaseModel, ConfigDict, Field

# ── AdCampaign ──
class AdCampaignBase(BaseModel):
    client_id: uuid.UUID | None = None
    platform: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=300)
    status: str = "active"
    daily_budget: float | None = None
    total_budget: float | None = None
    start_date: datetime_date | None = None
    end_date: datetime_date | None = None
    manager_id: uuid.UUID | None = None

class AdCampaignCreate(AdCampaignBase): pass
class AdCampaignUpdate(BaseModel):
    client_id: uuid.UUID | None = None
    platform: str | None = Field(None, min_length=1, max_length=100)
    name: str | None = Field(None, min_length=1, max_length=300)
    status: str | None = None
    daily_budget: float | None = None
    total_budget: float | None = None
    start_date: datetime_date | None = None
    end_date: datetime_date | None = None
    manager_id: uuid.UUID | None = None

class AdCampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    platform: str
    name: str
    status: str
    daily_budget: float | None
    total_budget: float | None
    start_date: datetime_date | None
    end_date: datetime_date | None
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── AdGroup ──
class AdGroupBase(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    status: str = "active"
    bid_amount: float | None = None
    target_audience: str | None = None

class AdGroupCreate(AdGroupBase): pass
class AdGroupUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=300)
    status: str | None = None
    bid_amount: float | None = None
    target_audience: str | None = None

class AdGroupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    name: str
    status: str
    bid_amount: float | None
    target_audience: str | None
    created_at: datetime
    updated_at: datetime

# ── AdMetric ──
class AdMetricBase(BaseModel):
    date: datetime_date
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    spend: float = 0.0
    cpc: float | None = None
    roas: float | None = None

class AdMetricCreate(AdMetricBase): pass
class AdMetricUpdate(BaseModel):
    date: datetime_date | None = None
    impressions: int | None = None
    clicks: int | None = None
    conversions: int | None = None
    spend: float | None = None
    cpc: float | None = None
    roas: float | None = None

class AdMetricRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    date: datetime_date
    impressions: int
    clicks: int
    conversions: int
    spend: float
    cpc: float | None
    roas: float | None
    created_at: datetime
