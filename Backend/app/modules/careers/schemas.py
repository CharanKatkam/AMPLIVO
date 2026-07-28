"""Pydantic schemas for the Careers module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.core.field_types import HttpUrlStr, NameStr, PhoneNumber
from app.core.sanitizers import SanitizedModel


class JobOpeningBase(SanitizedModel):
    title: NameStr
    department_id: Optional[uuid.UUID] = None
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    employment_type: str = Field(default="full_time", min_length=1, max_length=50)
    work_mode: Optional[str] = Field(None, min_length=1, max_length=50)
    vacancies: int = 1
    skills_required: Optional[list[str]] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = Field(None, min_length=1, max_length=100)
    status: str = Field(default="open", min_length=1, max_length=50)
    posted_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class JobOpeningCreate(JobOpeningBase):
    pass


class JobOpeningUpdate(SanitizedModel):
    title: Optional[NameStr] = None
    department_id: Optional[uuid.UUID] = None
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    employment_type: Optional[str] = Field(None, min_length=1, max_length=50)
    work_mode: Optional[str] = Field(None, min_length=1, max_length=50)
    vacancies: Optional[int] = None
    skills_required: Optional[list[str]] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    posted_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class JobOpeningRead(JobOpeningBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobApplicationBase(SanitizedModel):
    job_opening_id: uuid.UUID
    applicant_name: NameStr
    applicant_email: EmailStr
    applicant_phone: PhoneNumber = None
    resume_url: HttpUrlStr = None
    cover_letter: Optional[str] = None
    portfolio_url: HttpUrlStr = None
    skills: Optional[list[str]] = None
    education: Optional[list[dict]] = None
    work_history: Optional[list[dict]] = None
    status: str = Field(default="submitted", min_length=1, max_length=50)
    notes: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(SanitizedModel):
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    notes: Optional[str] = None


class JobApplicationRead(JobApplicationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Interviews

class InterviewCreate(SanitizedModel):
    interviewer: Optional[str] = Field(None, min_length=1, max_length=200)
    interview_type: str = Field(default="technical", min_length=1, max_length=100)
    scheduled_at: datetime
    meeting_link: HttpUrlStr = None
    notes: Optional[str] = None


class InterviewUpdate(SanitizedModel):
    interviewer: Optional[str] = Field(None, min_length=1, max_length=200)
    interview_type: Optional[str] = Field(None, min_length=1, max_length=100)
    scheduled_at: Optional[datetime] = None
    meeting_link: HttpUrlStr = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    feedback: Optional[str] = None
    notes: Optional[str] = None
    recommendation: Optional[str] = Field(None, min_length=1, max_length=100)


class InterviewCompleteRequest(SanitizedModel):
    feedback: Optional[str] = None
    recommendation: Optional[str] = Field(None, min_length=1, max_length=100)


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

    model_config = ConfigDict(from_attributes=True)


# Offers

class OfferCreate(SanitizedModel):
    salary: Optional[str] = Field(None, min_length=1, max_length=100)
    joining_date: Optional[date] = None
    offer_letter_url: HttpUrlStr = None


class OfferUpdate(SanitizedModel):
    salary: Optional[str] = Field(None, min_length=1, max_length=100)
    joining_date: Optional[date] = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    offer_letter_url: HttpUrlStr = None


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

    model_config = ConfigDict(from_attributes=True)
