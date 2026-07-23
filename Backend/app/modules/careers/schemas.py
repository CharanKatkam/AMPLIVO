"""Pydantic schemas for the Careers module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class JobOpeningBase(BaseModel):
    title: str
    department_id: Optional[uuid.UUID] = None
    location: Optional[str] = None
    employment_type: str = "full_time"
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    status: str = "open"
    posted_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class JobOpeningCreate(JobOpeningBase):
    pass


class JobOpeningUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None
    posted_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class JobOpeningRead(JobOpeningBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobApplicationBase(BaseModel):
    job_opening_id: uuid.UUID
    applicant_name: str
    applicant_email: str
    applicant_phone: Optional[str] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str = "submitted"
    notes: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class JobApplicationRead(JobApplicationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
