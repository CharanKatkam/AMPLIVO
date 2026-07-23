"""Pydantic schemas for the Creative module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

# ── CreativeProject ──
class CreativeProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    campaign_id: uuid.UUID | None = None
    description: str | None = None
    status: str = "briefing"
    due_date: date | None = None
    manager_id: uuid.UUID | None = None

class CreativeProjectCreate(CreativeProjectBase): pass
class CreativeProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    campaign_id: uuid.UUID | None = None
    description: str | None = None
    status: str | None = None
    due_date: date | None = None
    manager_id: uuid.UUID | None = None

class CreativeProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    client_id: uuid.UUID | None
    campaign_id: uuid.UUID | None
    description: str | None
    status: str
    due_date: date | None
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── CreativeAsset ──
class CreativeAssetBase(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    asset_type: str = Field(min_length=1, max_length=100)
    file_url: str | None = None
    version: str = "v1"
    status: str = "draft"
    designer_id: uuid.UUID | None = None

class CreativeAssetCreate(CreativeAssetBase): pass
class CreativeAssetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=300)
    asset_type: str | None = Field(None, min_length=1, max_length=100)
    file_url: str | None = None
    version: str | None = None
    status: str | None = None
    designer_id: uuid.UUID | None = None

class CreativeAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    asset_type: str
    file_url: str | None
    version: str
    status: str
    designer_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── CreativeFeedback ──
class CreativeFeedbackBase(BaseModel):
    content: str = Field(min_length=1)
    is_resolved: bool = False

class CreativeFeedbackCreate(CreativeFeedbackBase): pass
class CreativeFeedbackUpdate(BaseModel):
    content: str | None = Field(None, min_length=1)
    is_resolved: bool | None = None

class CreativeFeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    content: str
    user_id: uuid.UUID | None
    is_resolved: bool
    created_at: datetime
