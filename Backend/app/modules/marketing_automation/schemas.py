"""Pydantic schemas for the Marketing Automation module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel


class AutomationActionBase(SanitizedModel):
    action_type: str = Field(min_length=1, max_length=100)
    action_config: Optional[str] = Field(None, min_length=1, max_length=5000)
    delay_seconds: int = 0
    sort_order: int = 0


class AutomationActionCreate(AutomationActionBase):
    pass


class AutomationActionRead(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    action_type: str
    action_config: Optional[str] = None
    delay_seconds: int
    sort_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AutomationWorkflowBase(SanitizedModel):
    name: NameStr
    description: Optional[str] = Field(None, min_length=1, max_length=5000)
    trigger_type: str = Field(min_length=1, max_length=100)
    trigger_config: Optional[str] = Field(None, min_length=1, max_length=5000)
    status: str = Field(min_length=1, max_length=50)
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class AutomationWorkflowCreate(AutomationWorkflowBase):
    actions: list[AutomationActionCreate] = []


class AutomationWorkflowUpdate(SanitizedModel):
    name: Optional[NameStr] = None
    description: Optional[str] = Field(None, min_length=1, max_length=5000)
    trigger_type: Optional[str] = Field(None, min_length=1, max_length=100)
    trigger_config: Optional[str] = Field(None, min_length=1, max_length=5000)
    status: Optional[str] = Field(None, min_length=1, max_length=50)


class AutomationWorkflowRead(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Optional[str] = None
    status: str
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    actions: list[AutomationActionRead] = []

    model_config = ConfigDict(from_attributes=True)


class AutomationLogBase(SanitizedModel):
    workflow_id: uuid.UUID
    action_id: Optional[uuid.UUID] = None
    lead_id: Optional[uuid.UUID] = None
    status: str = Field(min_length=1, max_length=50)
    error_message: Optional[str] = Field(None, min_length=1, max_length=5000)
    executed_at: Optional[datetime] = None


class AutomationLogRead(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    action_id: Optional[uuid.UUID] = None
    lead_id: Optional[uuid.UUID] = None
    status: str
    error_message: Optional[str] = None
    executed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
