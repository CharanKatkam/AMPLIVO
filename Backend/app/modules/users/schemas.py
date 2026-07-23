"""Pydantic v2 schemas for the User Management module.

Covers: Users (list/detail/update), Roles, Permissions, Branches,
Departments, Teams, Designations, and User Profiles.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Roles ───────────────────────────────────────────────────────────────


class RoleBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9_]+$")
    description: str | None = None
    is_system: bool = False


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = Field(None, min_length=2, max_length=100, pattern=r"^[a-z0-9_]+$")
    description: str | None = None


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    is_system: bool
    created_at: datetime
    updated_at: datetime


# ── Permissions ─────────────────────────────────────────────────────────


class PermissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    module: str
    action: str
    slug: str
    description: str | None
    created_at: datetime


class PermissionCreate(BaseModel):
    module: str = Field(min_length=1, max_length=100)
    action: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=200)
    description: str | None = None


class RoleWithPermissions(RoleRead):
    permissions: list[PermissionRead] = []


# ── Branches ────────────────────────────────────────────────────────────


class BranchBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    code: str = Field(min_length=2, max_length=20)
    city: str = Field(min_length=1, max_length=100)
    state: str | None = None
    country: str = Field(min_length=2, max_length=100)
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    is_headquarters: bool = False
    is_sales_office: bool = False
    timezone: str = "Asia/Kolkata"
    is_active: bool = True


class BranchCreate(BranchBase):
    pass


class BranchUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    code: str | None = Field(None, min_length=2, max_length=20)
    city: str | None = Field(None, min_length=1, max_length=100)
    state: str | None = None
    country: str | None = Field(None, min_length=2, max_length=100)
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    is_headquarters: bool | None = None
    is_sales_office: bool | None = None
    timezone: str | None = None
    is_active: bool | None = None


class BranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    city: str
    state: str | None
    country: str
    address: str | None
    phone: str | None
    email: str | None
    is_headquarters: bool
    is_sales_office: bool
    timezone: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ── Departments ─────────────────────────────────────────────────────────


class DepartmentBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=200, pattern=r"^[a-z0-9_-]+$")
    description: str | None = None
    head_user_id: uuid.UUID | None = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = Field(None, min_length=2, max_length=200, pattern=r"^[a-z0-9_-]+$")
    description: str | None = None
    head_user_id: uuid.UUID | None = None


class DepartmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    head_user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


# ── Teams ───────────────────────────────────────────────────────────────


class TeamBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=200, pattern=r"^[a-z0-9_-]+$")
    description: str | None = None
    department_id: uuid.UUID | None = None
    lead_user_id: uuid.UUID | None = None
    is_active: bool = True


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = Field(None, min_length=2, max_length=200, pattern=r"^[a-z0-9_-]+$")
    description: str | None = None
    department_id: uuid.UUID | None = None
    lead_user_id: uuid.UUID | None = None
    is_active: bool | None = None


class TeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    department_id: uuid.UUID | None
    lead_user_id: uuid.UUID | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ── Designations ────────────────────────────────────────────────────────


class DesignationBase(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = None
    is_active: bool = True


class DesignationCreate(DesignationBase):
    pass


class DesignationUpdate(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    is_active: bool | None = None


class DesignationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ── User Profiles ───────────────────────────────────────────────────────


class UserProfileBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    avatar_url: str | None = None
    designation: str | None = None
    bio: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    date_of_joining: date | None = None
    timezone: str = "Asia/Kolkata"
    linkedin_url: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    address: str | None = None


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=200)
    avatar_url: str | None = None
    designation: str | None = None
    bio: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    date_of_joining: date | None = None
    timezone: str | None = None
    linkedin_url: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    address: str | None = None


class UserProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    full_name: str
    avatar_url: str | None
    designation: str | None
    bio: str | None
    gender: str | None
    date_of_birth: date | None
    date_of_joining: date | None
    timezone: str
    linkedin_url: str | None
    emergency_contact_name: str | None
    emergency_contact_phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime


# ── User (management-oriented views) ───────────────────────────────────


class UserListItem(BaseModel):
    """Compact user representation for list endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    phone: str | None
    user_type: str
    status: str
    role_id: uuid.UUID | None
    department_id: uuid.UUID | None
    branch_id: uuid.UUID | None
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None
    created_at: datetime


class UserDetail(BaseModel):
    """Full user detail including profile, role, department, branch."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    phone: str | None
    user_type: str
    status: str
    role_id: uuid.UUID | None
    department_id: uuid.UUID | None
    branch_id: uuid.UUID | None
    reporting_manager_id: uuid.UUID | None
    is_active: bool
    is_verified: bool
    verified_at: datetime | None
    last_login_at: datetime | None
    last_seen: datetime | None
    created_at: datetime
    updated_at: datetime
    profile: UserProfileRead | None = None


class UserUpdate(BaseModel):
    """Fields an admin can update on a user."""

    full_name: str | None = Field(None, min_length=2, max_length=150)
    phone: str | None = Field(None, max_length=20)
    user_type: str | None = None
    status: str | None = None
    role_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    branch_id: uuid.UUID | None = None
    reporting_manager_id: uuid.UUID | None = None
    is_active: bool | None = None
