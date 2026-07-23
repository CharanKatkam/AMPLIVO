"""Pydantic schemas for the Timesheets module."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class TimesheetBase(BaseModel):
    user_id: uuid.UUID
    task_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    date: date
    hours: float
    description: Optional[str] = None
    status: str = "submitted"
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None


class TimesheetCreate(TimesheetBase):
    pass


class TimesheetUpdate(BaseModel):
    hours: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None


class TimesheetRead(TimesheetBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
