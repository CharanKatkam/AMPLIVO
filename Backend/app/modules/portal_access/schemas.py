"""Pydantic schemas for the portal_access module."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PortalAccessTokenRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    resource_type: str
    resource_id: uuid.UUID
    lead_id: uuid.UUID | None
    is_single_use: bool
    used_at: datetime | None
    expires_at: datetime
    created_at: datetime
