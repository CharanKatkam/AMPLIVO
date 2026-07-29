"""Pydantic schemas for the Timesheets module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import SanitizedModel


class TimesheetBase(SanitizedModel):
    user_id: uuid.UUID
    task_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    date: date
    hours: float
    description: Optional[str] = Field(None, max_length=5000)
    status: str = Field("submitted", min_length=1, max_length=50)
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None


class TimesheetCreate(TimesheetBase):
    pass


class TimesheetUpdate(SanitizedModel):
    hours: Optional[float] = None
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None


class TimesheetRead(TimesheetBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
