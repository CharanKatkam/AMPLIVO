"""Pydantic schemas for the Tasks module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

# ── Project ──
class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    description: str | None = None
    status: str = "active"
    start_date: date | None = None
    end_date: date | None = None
    manager_id: uuid.UUID | None = None

class ProjectCreate(ProjectBase): pass
class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    client_id: uuid.UUID | None = None
    description: str | None = None
    status: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    manager_id: uuid.UUID | None = None

class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    client_id: uuid.UUID | None
    description: str | None
    status: str
    start_date: date | None
    end_date: date | None
    manager_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── Task ──
class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    project_id: uuid.UUID | None = None
    status: str = "todo"
    priority: str = "medium"
    due_date: datetime | None = None
    assigned_to: uuid.UUID | None = None

class TaskCreate(TaskBase): pass
class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    project_id: uuid.UUID | None = None
    status: str | None = None
    priority: str | None = None
    due_date: datetime | None = None
    assigned_to: uuid.UUID | None = None

class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    description: str | None
    project_id: uuid.UUID | None
    status: str
    priority: str
    due_date: datetime | None
    assigned_to: uuid.UUID | None
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── TaskComment ──
class TaskCommentBase(BaseModel):
    content: str = Field(min_length=1)

class TaskCommentCreate(TaskCommentBase): pass
class TaskCommentUpdate(BaseModel):
    content: str | None = Field(None, min_length=1)

class TaskCommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    task_id: uuid.UUID
    content: str
    user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

# ── TaskAttachment ──
class TaskAttachmentBase(BaseModel):
    file_name: str = Field(min_length=1, max_length=300)
    file_url: str

class TaskAttachmentCreate(TaskAttachmentBase): pass
class TaskAttachmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    task_id: uuid.UUID
    file_name: str
    file_url: str
    uploaded_by: uuid.UUID | None
    created_at: datetime
