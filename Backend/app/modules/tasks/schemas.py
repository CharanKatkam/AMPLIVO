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

# ── ProjectMember ──
class ProjectMemberCreate(BaseModel):
    user_id: uuid.UUID

class ProjectMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    user_id: uuid.UUID
    assigned_at: datetime

# ── Task ──
class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    project_id: uuid.UUID | None = None
    status: str = "todo"
    priority: str = "medium"
    progress: int = Field(0, ge=0, le=100)
    due_date: datetime | None = None
    assigned_to: uuid.UUID | None = None

class TaskCreate(TaskBase): pass
class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    project_id: uuid.UUID | None = None
    status: str | None = None
    priority: str | None = None
    progress: int | None = Field(None, ge=0, le=100)
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
    progress: int
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

# ── TaskSubmission ──
class TaskSubmissionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    work_summary: str | None = None
    deliverable_type: str = "link"
    external_url: str | None = None
    completion_percentage: int = Field(100, ge=0, le=100)

class TaskSubmissionUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    work_summary: str | None = None
    deliverable_type: str | None = None
    external_url: str | None = None
    completion_percentage: int | None = Field(None, ge=0, le=100)

class TaskSubmissionReview(BaseModel):
    approve: bool
    reviewer_feedback: str | None = None

class TaskSubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    task_id: uuid.UUID
    submitted_by: uuid.UUID | None
    title: str
    work_summary: str | None
    deliverable_type: str
    external_url: str | None
    completion_percentage: int
    status: str
    reviewer_feedback: str | None
    reviewed_by: uuid.UUID | None
    reviewed_at: datetime | None
    version_number: int
    created_at: datetime
    updated_at: datetime
