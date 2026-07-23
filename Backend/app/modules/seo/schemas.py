"""Pydantic schemas for the SEO module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

# ── SeoProject ──
class SeoProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    target_url: str = Field(min_length=1, max_length=500)
    description: str | None = None
    status: str = "active"
    manager_id: uuid.UUID | None = None

class SeoProjectCreate(SeoProjectBase): pass
class SeoProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    target_url: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    status: str | None = None
    manager_id: uuid.UUID | None = None

class SeoProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    client_id: uuid.UUID | None
    target_url: str
    description: str | None
    status: str
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── SeoKeyword ──
class SeoKeywordBase(BaseModel):
    keyword: str = Field(min_length=1, max_length=200)
    search_volume: int | None = None
    difficulty: float | None = None
    current_rank: int | None = None
    target_rank: int | None = None
    url: str | None = None

class SeoKeywordCreate(SeoKeywordBase): pass
class SeoKeywordUpdate(BaseModel):
    keyword: str | None = Field(None, min_length=1, max_length=200)
    search_volume: int | None = None
    difficulty: float | None = None
    current_rank: int | None = None
    target_rank: int | None = None
    url: str | None = None

class SeoKeywordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    keyword: str
    search_volume: int | None
    difficulty: float | None
    current_rank: int | None
    target_rank: int | None
    url: str | None
    created_at: datetime
    updated_at: datetime

# ── SeoAudit ──
class SeoAuditBase(BaseModel):
    audit_date: date
    health_score: float | None = None
    errors_count: int | None = None
    warnings_count: int | None = None
    notices_count: int | None = None
    report_url: str | None = None

class SeoAuditCreate(SeoAuditBase): pass
class SeoAuditUpdate(BaseModel):
    audit_date: date | None = None
    health_score: float | None = None
    errors_count: int | None = None
    warnings_count: int | None = None
    notices_count: int | None = None
    report_url: str | None = None

class SeoAuditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    audit_date: date
    health_score: float | None
    errors_count: int | None
    warnings_count: int | None
    notices_count: int | None
    report_url: str | None
    conducted_by: uuid.UUID | None
    created_at: datetime

# ── SeoBacklink ──
class SeoBacklinkBase(BaseModel):
    source_url: str = Field(min_length=1, max_length=500)
    target_url: str = Field(min_length=1, max_length=500)
    domain_authority: int | None = None
    is_dofollow: bool = True
    status: str = "active"
    discovered_at: date | None = None

class SeoBacklinkCreate(SeoBacklinkBase): pass
class SeoBacklinkUpdate(BaseModel):
    source_url: str | None = Field(None, min_length=1, max_length=500)
    target_url: str | None = Field(None, min_length=1, max_length=500)
    domain_authority: int | None = None
    is_dofollow: bool | None = None
    status: str | None = None
    discovered_at: date | None = None

class SeoBacklinkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    source_url: str
    target_url: str
    domain_authority: int | None
    is_dofollow: bool
    status: str
    discovered_at: date | None
    created_at: datetime
    updated_at: datetime
