"""Pydantic schemas for the Activity Timeline module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import SanitizedModel


class ActivityLogBase(SanitizedModel):
    user_id: Optional[uuid.UUID] = None
    entity_type: str = Field(min_length=1, max_length=100)
    entity_id: Optional[uuid.UUID] = None
    action: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    extra_data: Optional[str] = None
    ip_address: Optional[str] = Field(None, min_length=7, max_length=45)


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogRead(ActivityLogBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
