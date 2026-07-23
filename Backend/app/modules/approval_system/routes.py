"""Routes for the Approval System module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.approval_system.dependencies import get_approval_policy_service, get_approval_request_service
from app.modules.approval_system.schemas import (
    ApprovalDecisionCreate, ApprovalDecisionRead,
    ApprovalPolicyCreate, ApprovalPolicyRead,
    ApprovalRequestCreate, ApprovalRequestRead, ApprovalRequestUpdate,
)
from app.modules.approval_system.service import ApprovalPolicyService, ApprovalRequestService

router = APIRouter(prefix="/approvals", tags=["Approval System"])


# -- Policies --
@router.get("/policies", response_model=list[ApprovalPolicyRead])
async def list_policies(service: ApprovalPolicyService = Depends(get_approval_policy_service)):
    return await service.list_all()


@router.post("/policies", response_model=ApprovalPolicyRead, status_code=status.HTTP_201_CREATED)
async def create_policy(data: ApprovalPolicyCreate, service: ApprovalPolicyService = Depends(get_approval_policy_service)):
    return await service.create(data)


@router.delete("/policies/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(id: uuid.UUID, service: ApprovalPolicyService = Depends(get_approval_policy_service)):
    await service.delete(id)


# -- Requests --
@router.get("", response_model=list[ApprovalRequestRead])
async def list_requests(skip: int = 0, limit: int = 100, service: ApprovalRequestService = Depends(get_approval_request_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=ApprovalRequestRead)
async def get_request(id: uuid.UUID, service: ApprovalRequestService = Depends(get_approval_request_service)):
    return await service.get(id)


@router.post("", response_model=ApprovalRequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(data: ApprovalRequestCreate, service: ApprovalRequestService = Depends(get_approval_request_service)):
    return await service.create(data)


@router.put("/{id}", response_model=ApprovalRequestRead)
async def update_request(id: uuid.UUID, data: ApprovalRequestUpdate, service: ApprovalRequestService = Depends(get_approval_request_service)):
    obj = await service.get(id)
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.modules.approval_system.repository import ApprovalRequestRepository
    from app.db.session import get_session
    async with get_session() as session:
        repo = ApprovalRequestRepository(session)
        await repo.update(obj, data.model_dump(exclude_unset=True))
    return await service.get(id)


@router.post("/{id}/decisions", response_model=ApprovalDecisionRead, status_code=status.HTTP_201_CREATED)
async def create_decision(id: uuid.UUID, data: ApprovalDecisionCreate, service: ApprovalRequestService = Depends(get_approval_request_service)):
    return await service.approve(id, data)


@router.get("/{id}/decisions", response_model=list[ApprovalDecisionRead])
async def list_decisions(id: uuid.UUID, service: ApprovalRequestService = Depends(get_approval_request_service)):
    return await service.list_decisions(id)
