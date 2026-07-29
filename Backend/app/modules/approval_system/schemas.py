"""Pydantic schemas for the Approval System module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import NameStr
from app.core.sanitizers import SanitizedModel


class ApprovalPolicyBase(SanitizedModel):
    name: NameStr
    module: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    required_approvers: int = 1
    is_active: bool = True


class ApprovalPolicyCreate(ApprovalPolicyBase):
    pass


class ApprovalPolicyRead(ApprovalPolicyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalRequestBase(SanitizedModel):
    policy_id: Optional[uuid.UUID] = None
    entity_type: str = Field(min_length=1, max_length=100)
    entity_id: uuid.UUID
    title: NameStr
    description: Optional[str] = None
    requested_by: Optional[uuid.UUID] = None
    status: str = Field(default="pending", min_length=1, max_length=50)


class ApprovalRequestCreate(ApprovalRequestBase):
    pass


class ApprovalRequestUpdate(SanitizedModel):
    status: Optional[str] = Field(None, min_length=1, max_length=50)


class ApprovalRequestRead(ApprovalRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalDecisionBase(SanitizedModel):
    request_id: uuid.UUID
    approver_id: Optional[uuid.UUID] = None
    decision: str = Field(min_length=1, max_length=50)
    comment: Optional[str] = None


class ApprovalDecisionCreate(ApprovalDecisionBase):
    pass


class ApprovalDecisionRead(ApprovalDecisionBase):
    id: uuid.UUID
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)
