"""Routes for the Approval System module.

Every route here previously required nothing but `get_current_user` (any
authenticated role, including `client`) - any signed-in user, of any kind,
could create/delete approval policies or approve/reject arbitrary approval
requests. Policy governance (who defines what needs approval) is now
admin-only; everything else is at minimum staff-only (client-portal users
excluded).

NOTE: this module has no concept of a per-policy "designated approver
role" - `require_roles(*STAFF_ROLE_SLUGS)` on the request/decision routes
below is a baseline (blocks the external `client` role, nothing else) not
a full approval-hierarchy implementation. Restricting *which* staff role
may decide on *which* policy's requests is a business-logic decision for
the approval-workflow owner, not something to invent at the RBAC layer -
flagged in the auth architecture report rather than guessed at here.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.rbac import STAFF_ROLE_SLUGS, require_roles
from app.models.user import User
from app.modules.approval_system.dependencies import get_approval_policy_service, get_approval_request_service
from app.modules.approval_system.schemas import (
    ApprovalDecisionCreate, ApprovalDecisionRead,
    ApprovalPolicyCreate, ApprovalPolicyRead,
    ApprovalRequestCreate, ApprovalRequestRead, ApprovalRequestUpdate,
)
from app.modules.approval_system.service import ApprovalPolicyService, ApprovalRequestService

router = APIRouter(prefix="/approvals", tags=["Approval System"])


# -- Policies (governance - admin only) --
@router.get("/policies", response_model=list[ApprovalPolicyRead])
async def list_policies(service: ApprovalPolicyService = Depends(get_approval_policy_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    return await service.list_all()


@router.post("/policies", response_model=ApprovalPolicyRead, status_code=status.HTTP_201_CREATED)
async def create_policy(data: ApprovalPolicyCreate, db: AsyncSession = Depends(get_db), service: ApprovalPolicyService = Depends(get_approval_policy_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("admin"))):
    # NOTE: this router previously never called db.commit() anywhere, so every
    # write silently rolled back at request end (confirmed pre-existing, not
    # introduced here) — every mutating route now commits explicitly.
    obj = await service.create(data); await db.commit()
    return obj


@router.delete("/policies/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: ApprovalPolicyService = Depends(get_approval_policy_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("admin"))):
    await service.delete(id); await db.commit()


# -- Requests (internal staff only - see module docstring) --
@router.get("", response_model=list[ApprovalRequestRead])
async def list_requests(skip: int = 0, limit: int = 100, service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=ApprovalRequestRead)
async def get_request(id: uuid.UUID, service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    return await service.get(id)


@router.post("", response_model=ApprovalRequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(data: ApprovalRequestCreate, db: AsyncSession = Depends(get_db), service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    obj = await service.create(data); await db.commit()
    return obj


@router.put("/{id}", response_model=ApprovalRequestRead)
async def update_request(id: uuid.UUID, data: ApprovalRequestUpdate, service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    obj = await service.get(id)
    from app.modules.approval_system.repository import ApprovalRequestRepository
    from app.db.session import get_session
    async with get_session() as session:
        repo = ApprovalRequestRepository(session)
        await repo.update(obj, data.model_dump(exclude_unset=True))
        await session.commit()
    return await service.get(id)


@router.post("/{id}/decisions", response_model=ApprovalDecisionRead, status_code=status.HTTP_201_CREATED)
async def create_decision(id: uuid.UUID, data: ApprovalDecisionCreate, db: AsyncSession = Depends(get_db), service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    obj = await service.approve(id, data); await db.commit()
    return obj


@router.get("/{id}/decisions", response_model=list[ApprovalDecisionRead])
async def list_decisions(id: uuid.UUID, service: ApprovalRequestService = Depends(get_approval_request_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles(*STAFF_ROLE_SLUGS))):
    return await service.list_decisions(id)
