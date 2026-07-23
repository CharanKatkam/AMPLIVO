"""Pydantic schemas for the Analytics module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── Dashboard ──
class DashboardBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    is_shared: bool = False
    layout_config: str | None = None

class DashboardCreate(DashboardBase): pass
class DashboardUpdate(BaseModel):
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
class ReportBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    report_type: str = Field(min_length=1, max_length=100)
    client_id: uuid.UUID | None = None
    parameters: str | None = None

class ReportCreate(ReportBase): pass
class ReportUpdate(BaseModel):
    status: str | None = None
    generated_file_url: str | None = None

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
class DataIntegrationBase(BaseModel):
    client_id: uuid.UUID | None = None
    provider_name: str = Field(min_length=1, max_length=100)
    credentials_json: str | None = None
    status: str = "active"

class DataIntegrationCreate(DataIntegrationBase): pass
class DataIntegrationUpdate(BaseModel):
    credentials_json: str | None = None
    status: str | None = None

class DataIntegrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    provider_name: str
    status: str
    last_sync: datetime | None
    created_at: datetime
    updated_at: datetime
