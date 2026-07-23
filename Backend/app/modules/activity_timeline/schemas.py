"""Pydantic schemas for the Activity Timeline module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ActivityLogBase(BaseModel):
    user_id: Optional[uuid.UUID] = None
    entity_type: str
    entity_id: Optional[uuid.UUID] = None
    action: str
    description: Optional[str] = None
    extra_data: Optional[str] = None
    ip_address: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogRead(ActivityLogBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
