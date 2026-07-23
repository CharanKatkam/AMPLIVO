"""Pydantic schemas for Lead Management."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── LeadSource ──
class LeadSourceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=200, pattern=r"^[a-z0-9_-]+$")
    description: str | None = None
    is_active: bool = True
class LeadSourceUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    is_active: bool | None = None
class LeadSourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; name: str; slug: str; description: str | None; is_active: bool; created_at: datetime; updated_at: datetime

# ── Lead ──
class LeadCreate(BaseModel):
    title: str = Field(min_length=2, max_length=300)
    company_name: str | None = None; contact_name: str | None = None
    email: str | None = None; phone: str | None = None
    source_id: uuid.UUID | None = None; client_id: uuid.UUID | None = None
    status: str = "new"; priority: str = "medium"
    estimated_value: float | None = None; assigned_to: uuid.UUID | None = None; notes: str | None = None
class LeadUpdate(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=300)
    company_name: str | None = None; contact_name: str | None = None
    email: str | None = None; phone: str | None = None
    source_id: uuid.UUID | None = None; client_id: uuid.UUID | None = None
    status: str | None = None; priority: str | None = None
    estimated_value: float | None = None; assigned_to: uuid.UUID | None = None; notes: str | None = None
class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; title: str; company_name: str | None; contact_name: str | None
    email: str | None; phone: str | None; source_id: uuid.UUID | None; client_id: uuid.UUID | None
    status: str; priority: str; estimated_value: float | None
    assigned_to: uuid.UUID | None; converted_client_id: uuid.UUID | None
    converted_at: datetime | None; notes: str | None
    created_by: uuid.UUID | None; created_at: datetime; updated_at: datetime

# ── LeadActivity ──
class LeadActivityCreate(BaseModel):
    activity_type: str = Field(min_length=1, max_length=100)
    description: str | None = None
class LeadActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; lead_id: uuid.UUID; activity_type: str; description: str | None
    performed_by: uuid.UUID | None; created_at: datetime

# ── LeadFollowup ──
class LeadFollowupCreate(BaseModel):
    followup_date: datetime; followup_type: str = "call"
    notes: str | None = None; status: str = "pending"; assigned_to: uuid.UUID | None = None
class LeadFollowupUpdate(BaseModel):
    followup_date: datetime | None = None; followup_type: str | None = None
    notes: str | None = None; status: str | None = None; assigned_to: uuid.UUID | None = None
class LeadFollowupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; lead_id: uuid.UUID; followup_date: datetime; followup_type: str
    notes: str | None; status: str; assigned_to: uuid.UUID | None; created_at: datetime; updated_at: datetime

# ── SalesPipeline ──
class SalesPipelineCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    stage: str = Field(min_length=1, max_length=100)
    order: int = 0; probability: float | None = None; is_active: bool = True
class SalesPipelineUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    stage: str | None = None; order: int | None = None; probability: float | None = None; is_active: bool | None = None
class SalesPipelineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; name: str; stage: str; order: int; probability: float | None
    is_active: bool; created_at: datetime; updated_at: datetime

# ── Lead Conversion ──
class LeadConvertRequest(BaseModel):
    client_id: uuid.UUID
