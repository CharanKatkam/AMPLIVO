"""Pydantic schemas for the Campaigns module."""
from __future__ import annotations
import uuid
from datetime import datetime, date as datetime_date
from pydantic import BaseModel, ConfigDict, Field

# ── Campaign ──
class CampaignBase(BaseModel):
    name: str = Field(min_length=2, max_length=300)
    client_id: uuid.UUID
    type: str = Field(min_length=2, max_length=100)
    status: str = "draft"
    start_date: datetime_date | None = None
    end_date: datetime_date | None = None
    budget: float | None = None
    spent_amount: float = 0.0
    target_audience: str | None = None
    description: str | None = None
    manager_id: uuid.UUID | None = None

class CampaignCreate(CampaignBase): pass

class CampaignUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=300)
    client_id: uuid.UUID | None = None
    type: str | None = Field(None, min_length=2, max_length=100)
    status: str | None = None
    start_date: datetime_date | None = None
    end_date: datetime_date | None = None
    budget: float | None = None
    spent_amount: float | None = None
    target_audience: str | None = None
    description: str | None = None
    manager_id: uuid.UUID | None = None

class CampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    client_id: uuid.UUID
    type: str
    status: str
    start_date: datetime_date | None
    end_date: datetime_date | None
    budget: float | None
    spent_amount: float
    target_audience: str | None
    description: str | None
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── CampaignPlatform ──
class CampaignPlatformBase(BaseModel):
    platform_name: str = Field(min_length=1, max_length=100)
    account_id: str | None = None
    status: str = "active"
    budget_allocation: float | None = None

class CampaignPlatformCreate(CampaignPlatformBase): pass
class CampaignPlatformUpdate(BaseModel):
    platform_name: str | None = Field(None, min_length=1, max_length=100)
    account_id: str | None = None
    status: str | None = None
    budget_allocation: float | None = None

class CampaignPlatformRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    platform_name: str
    account_id: str | None
    status: str
    budget_allocation: float | None
    created_at: datetime

# ── CampaignAsset ──
class CampaignAssetBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    asset_type: str = Field(min_length=1, max_length=100)
    file_url: str | None = None
    status: str = "pending"

class CampaignAssetCreate(CampaignAssetBase): pass
class CampaignAssetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    asset_type: str | None = Field(None, min_length=1, max_length=100)
    file_url: str | None = None
    status: str | None = None

class CampaignAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    name: str
    asset_type: str
    file_url: str | None
    status: str
    uploaded_by: uuid.UUID | None
    created_at: datetime

# ── CampaignMetric ──
class CampaignMetricBase(BaseModel):
    date: datetime_date
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    spend: float = 0.0

class CampaignMetricCreate(CampaignMetricBase): pass
class CampaignMetricUpdate(BaseModel):
    date: datetime_date | None = None
    impressions: int | None = None
    clicks: int | None = None
    conversions: int | None = None
    spend: float | None = None

class CampaignMetricRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    date: datetime_date
    impressions: int
    clicks: int
    conversions: int
    spend: float
    created_at: datetime
