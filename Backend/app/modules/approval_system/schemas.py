"""Pydantic schemas for the Approval System module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApprovalPolicyBase(BaseModel):
    name: str
    module: str
    description: Optional[str] = None
    required_approvers: int = 1
    is_active: bool = True


class ApprovalPolicyCreate(ApprovalPolicyBase):
    pass


class ApprovalPolicyRead(ApprovalPolicyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApprovalRequestBase(BaseModel):
    policy_id: Optional[uuid.UUID] = None
    entity_type: str
    entity_id: uuid.UUID
    title: str
    description: Optional[str] = None
    requested_by: Optional[uuid.UUID] = None
    status: str = "pending"


class ApprovalRequestCreate(ApprovalRequestBase):
    pass


class ApprovalRequestUpdate(BaseModel):
    status: Optional[str] = None


class ApprovalRequestRead(ApprovalRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApprovalDecisionBase(BaseModel):
    request_id: uuid.UUID
    approver_id: Optional[uuid.UUID] = None
    decision: str
    comment: Optional[str] = None


class ApprovalDecisionCreate(ApprovalDecisionBase):
    pass


class ApprovalDecisionRead(ApprovalDecisionBase):
    id: uuid.UUID
    decided_at: datetime

    model_config = {"from_attributes": True}
