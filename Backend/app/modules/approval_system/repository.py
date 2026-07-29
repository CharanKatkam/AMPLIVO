"""Repository for the Approval System module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.approval_system.models import ApprovalPolicy, ApprovalRequest, ApprovalDecision


class ApprovalPolicyRepository(BaseRepository[ApprovalPolicy]):
    model = ApprovalPolicy

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class ApprovalRequestRepository(BaseRepository[ApprovalRequest]):
    model = ApprovalRequest

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class ApprovalDecisionRepository(BaseRepository[ApprovalDecision]):
    model = ApprovalDecision

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
