"""Pydantic schemas for the CRM module."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ── Client ──────────────────────────────────────────────────────────────
class ClientBase(BaseModel):
    company_name: str = Field(min_length=2, max_length=300)
    display_name: str | None = None
    industry: str | None = None
    website: str | None = None
    email: str | None = None
    phone: str | None = None
    gst_number: str | None = None
    pan_number: str | None = None
    client_type: str | None = "regular"
    status: str = "active"
    assigned_to: uuid.UUID | None = None
    branch_id: uuid.UUID | None = None
    onboarding_date: datetime | None = None
    notes: str | None = None
    is_active: bool = True

class ClientCreate(ClientBase): pass
class ClientUpdate(BaseModel):
    company_name: str | None = Field(None, min_length=2, max_length=300)
    display_name: str | None = None
    industry: str | None = None
    website: str | None = None
    email: str | None = None
    phone: str | None = None
    gst_number: str | None = None
    pan_number: str | None = None
    client_type: str | None = None
    status: str | None = None
    assigned_to: uuid.UUID | None = None
    branch_id: uuid.UUID | None = None
    onboarding_date: datetime | None = None
    notes: str | None = None
    is_active: bool | None = None

class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    company_name: str
    display_name: str | None
    industry: str | None
    website: str | None
    email: str | None
    phone: str | None
    gst_number: str | None
    pan_number: str | None
    client_type: str | None
    status: str
    assigned_to: uuid.UUID | None
    branch_id: uuid.UUID | None
    onboarding_date: datetime | None
    notes: str | None
    is_active: bool
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── Client Contact ──────────────────────────────────────────────────────
class ClientContactBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: str | None = None
    phone: str | None = None
    designation: str | None = None
    is_primary: bool = False
    is_active: bool = True

class ClientContactCreate(ClientContactBase): pass
class ClientContactUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    email: str | None = None
    phone: str | None = None
    designation: str | None = None
    is_primary: bool | None = None
    is_active: bool | None = None

class ClientContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    designation: str | None
    is_primary: bool
    is_active: bool
    user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── Client Address ──────────────────────────────────────────────────────
class ClientAddressBase(BaseModel):
    address_type: str = "billing"
    address_line_1: str = Field(min_length=2, max_length=500)
    address_line_2: str | None = None
    city: str = Field(min_length=1, max_length=100)
    state: str | None = None
    country: str = "India"
    postal_code: str | None = None
    is_primary: bool = False

class ClientAddressCreate(ClientAddressBase): pass
class ClientAddressUpdate(BaseModel):
    address_type: str | None = None
    address_line_1: str | None = Field(None, min_length=2, max_length=500)
    address_line_2: str | None = None
    city: str | None = Field(None, min_length=1, max_length=100)
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    is_primary: bool | None = None

class ClientAddressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    address_type: str
    address_line_1: str
    address_line_2: str | None
    city: str
    state: str | None
    country: str
    postal_code: str | None
    is_primary: bool
    created_at: datetime
    updated_at: datetime

# ── Client Document ─────────────────────────────────────────────────────
class ClientDocumentBase(BaseModel):
    title: str = Field(min_length=2, max_length=300)
    document_type: str | None = None
    file_url: str | None = None
    file_size: int | None = None

class ClientDocumentCreate(ClientDocumentBase): pass
class ClientDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    title: str
    document_type: str | None
    file_url: str | None
    file_size: int | None
    uploaded_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── Client Note ─────────────────────────────────────────────────────────
class ClientNoteBase(BaseModel):
    content: str = Field(min_length=1)

class ClientNoteCreate(ClientNoteBase): pass
class ClientNoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID
    content: str
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
