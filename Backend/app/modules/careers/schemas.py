"""Pydantic schemas for the Careers module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class JobOpeningBase(BaseModel):
    title: str
    department_id: Optional[uuid.UUID] = None
    location: Optional[str] = None
    employment_type: str = "full_time"
    work_mode: Optional[str] = None
    vacancies: int = 1
    skills_required: Optional[list[str]] = None
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
    work_mode: Optional[str] = None
    vacancies: Optional[int] = None
    skills_required: Optional[list[str]] = None
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
    portfolio_url: Optional[str] = None
    skills: Optional[list[str]] = None
    education: Optional[list[dict]] = None
    work_history: Optional[list[dict]] = None
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


# ── Interviews ──

class InterviewCreate(BaseModel):
    interviewer: Optional[str] = None
    interview_type: str = "technical"
    scheduled_at: datetime
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    interviewer: Optional[str] = None
    interview_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None
    recommendation: Optional[str] = None


class InterviewCompleteRequest(BaseModel):
    feedback: Optional[str] = None
    recommendation: Optional[str] = None


class InterviewRead(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    interviewer: Optional[str]
    interview_type: str
    scheduled_at: datetime
    meeting_link: Optional[str]
    status: str
    feedback: Optional[str]
    notes: Optional[str]
    recommendation: Optional[str]
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Offers ──

class OfferCreate(BaseModel):
    salary: Optional[str] = None
    joining_date: Optional[date] = None
    offer_letter_url: Optional[str] = None


class OfferUpdate(BaseModel):
    salary: Optional[str] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None
    offer_letter_url: Optional[str] = None


class OfferRead(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    salary: Optional[str]
    joining_date: Optional[date]
    status: str
    offer_letter_url: Optional[str]
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
