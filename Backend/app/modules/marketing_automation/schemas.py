"""Pydantic schemas for the Marketing Automation module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AutomationActionBase(BaseModel):
    action_type: str
    action_config: Optional[str] = None
    delay_seconds: int = 0
    sort_order: int = 0


class AutomationActionCreate(AutomationActionBase):
    pass


class AutomationActionRead(AutomationActionBase):
    id: uuid.UUID
    workflow_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class AutomationWorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Optional[str] = None
    status: str = "draft"
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class AutomationWorkflowCreate(AutomationWorkflowBase):
    actions: list[AutomationActionCreate] = []


class AutomationWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[str] = None
    status: Optional[str] = None


class AutomationWorkflowRead(AutomationWorkflowBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    actions: list[AutomationActionRead] = []

    model_config = {"from_attributes": True}


class AutomationLogBase(BaseModel):
    workflow_id: uuid.UUID
    action_id: Optional[uuid.UUID] = None
    lead_id: Optional[uuid.UUID] = None
    status: str = "pending"
    error_message: Optional[str] = None
    executed_at: Optional[datetime] = None


class AutomationLogRead(AutomationLogBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
