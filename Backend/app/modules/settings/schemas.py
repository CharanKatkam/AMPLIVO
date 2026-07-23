"""Pydantic schemas for the Settings module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── SystemSetting ──
class SystemSettingBase(BaseModel):
    key: str = Field(min_length=1, max_length=100)
    value: str = Field(min_length=1)
    description: str | None = None
    is_public: bool = False

class SystemSettingCreate(SystemSettingBase): pass
class SystemSettingUpdate(BaseModel):
    value: str | None = Field(None, min_length=1)
    description: str | None = None
    is_public: bool | None = None

class SystemSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    key: str
    value: str
    description: str | None
    is_public: bool
    updated_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── UserPreference ──
class UserPreferenceBase(BaseModel):
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"
    email_notifications: bool = True
    in_app_notifications: bool = True

class UserPreferenceCreate(UserPreferenceBase): pass
class UserPreferenceUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    timezone: str | None = None
    email_notifications: bool | None = None
    in_app_notifications: bool | None = None

class UserPreferenceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    theme: str
    language: str
    timezone: str
    email_notifications: bool
    in_app_notifications: bool
    created_at: datetime
    updated_at: datetime
