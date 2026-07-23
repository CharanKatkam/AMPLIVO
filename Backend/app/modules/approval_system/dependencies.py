"""Dependencies for the Approval System module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.approval_system.service import ApprovalPolicyService, ApprovalRequestService


def get_approval_policy_service(db: AsyncSession = Depends(get_db)) -> ApprovalPolicyService:
    return ApprovalPolicyService(db)


def get_approval_request_service(db: AsyncSession = Depends(get_db)) -> ApprovalRequestService:
    return ApprovalRequestService(db)
