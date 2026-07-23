"""Service for the Approval System module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.approval_system.models import ApprovalPolicy, ApprovalRequest, ApprovalDecision
from app.modules.approval_system.repository import ApprovalPolicyRepository, ApprovalRequestRepository, ApprovalDecisionRepository
from app.modules.approval_system.schemas import ApprovalPolicyCreate, ApprovalRequestCreate, ApprovalDecisionCreate
from app.core.exceptions import NotFoundException


class ApprovalPolicyService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ApprovalPolicyRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ApprovalPolicy]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ApprovalPolicy:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Approval policy not found")
        return obj

    async def create(self, data: ApprovalPolicyCreate) -> ApprovalPolicy:
        return await self._repo.create_from_dict(data.model_dump())

    async def delete(self, id: uuid.UUID) -> None:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Approval policy not found")
        await self._repo.delete(obj.id)


class ApprovalRequestService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ApprovalRequestRepository(session)
        self._decision_repo = ApprovalDecisionRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ApprovalRequest]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ApprovalRequest:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Approval request not found")
        return obj

    async def create(self, data: ApprovalRequestCreate) -> ApprovalRequest:
        return await self._repo.create_from_dict(data.model_dump())

    async def approve(self, id: uuid.UUID, decision: ApprovalDecisionCreate) -> ApprovalDecision:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Approval request not found")
        decision.request_id = id
        return await self._decision_repo.create_from_dict(decision.model_dump())

    async def list_decisions(self, request_id: uuid.UUID) -> list[ApprovalDecision]:
        return await self._decision_repo.get_all()
