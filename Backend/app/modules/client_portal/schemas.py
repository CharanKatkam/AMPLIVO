"""Pydantic schemas for the Client Portal module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── PortalSetting ──
class PortalSettingBase(BaseModel):
    client_id: uuid.UUID
    custom_domain: str | None = None
    theme_color: str | None = None
    logo_url: str | None = None
    features_enabled: str | None = None

class PortalSettingCreate(PortalSettingBase): pass
class PortalSettingUpdate(BaseModel):
    custom_domain: str | None = None
    theme_color: str | None = None
    logo_url: str | None = None
    features_enabled: str | None = None

class PortalSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    custom_domain: str | None
    theme_color: str | None
    logo_url: str | None
    features_enabled: str | None
    created_at: datetime
    updated_at: datetime

# ── PortalAnnouncement ──
class PortalAnnouncementBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    client_id: uuid.UUID | None = None
    is_active: bool = True

class PortalAnnouncementCreate(PortalAnnouncementBase): pass
class PortalAnnouncementUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = Field(None, min_length=1)
    client_id: uuid.UUID | None = None
    is_active: bool | None = None

class PortalAnnouncementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    content: str
    client_id: uuid.UUID | None
    is_active: bool
    author_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── PortalResource ──
class PortalResourceBase(BaseModel):
    client_id: uuid.UUID
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    file_url: str = Field(min_length=1, max_length=500)
    resource_type: str = Field(min_length=1, max_length=100)

class PortalResourceCreate(PortalResourceBase): pass
class PortalResourceUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    file_url: str | None = Field(None, min_length=1, max_length=500)
    resource_type: str | None = Field(None, min_length=1, max_length=100)

class PortalResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    title: str
    description: str | None
    file_url: str
    resource_type: str
    uploaded_by: uuid.UUID | None
    created_at: datetime
