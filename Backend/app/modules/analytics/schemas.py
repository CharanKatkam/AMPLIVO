"""Pydantic schemas for the Analytics module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import HttpUrlStr
from app.core.sanitizers import SanitizedModel

# ── Dashboard ──
class DashboardBase(SanitizedModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    is_shared: bool = False
    layout_config: str | None = None

class DashboardCreate(DashboardBase): pass
class DashboardUpdate(SanitizedModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    is_shared: bool | None = None
    layout_config: str | None = None

class DashboardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str | None
    is_shared: bool
    layout_config: str | None
    owner_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── Report ──
class ReportBase(SanitizedModel):
    name: str = Field(min_length=1, max_length=200)
    report_type: str = Field(min_length=1, max_length=100)
    client_id: uuid.UUID | None = None
    parameters: str | None = None

class ReportCreate(ReportBase): pass
class ReportUpdate(SanitizedModel):
    status: str | None = Field(None, min_length=1, max_length=50)
    generated_file_url: HttpUrlStr = None

class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    report_type: str
    client_id: uuid.UUID | None
    parameters: str | None
    generated_file_url: str | None
    status: str
    generated_by: uuid.UUID | None
    created_at: datetime

# ── DataIntegration ──
class DataIntegrationBase(SanitizedModel):
    client_id: uuid.UUID | None = None
    provider_name: str = Field(min_length=1, max_length=100)
    credentials_json: str | None = None
    status: str = Field(default="active", min_length=1, max_length=50)

class DataIntegrationCreate(DataIntegrationBase): pass
class DataIntegrationUpdate(SanitizedModel):
    credentials_json: str | None = None
    status: str | None = Field(None, min_length=1, max_length=50)

class DataIntegrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    provider_name: str
    status: str
    last_sync: datetime | None
    created_at: datetime
    updated_at: datetime
