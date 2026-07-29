"""Routes for the Consultation Requests module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.rbac import require_roles
from app.models.user import User
from app.modules.consultation_requests.dependencies import get_consultation_service
from app.modules.consultation_requests.schemas import ConsultationRequestCreate, ConsultationRequestRead, ConsultationRequestUpdate
from app.modules.consultation_requests.service import ConsultationRequestService

router = APIRouter(prefix="/consultation-requests", tags=["Consultation Requests"])


# POST stays public (the site's own consultation-request lead-gen form) -
# everything else exposes submitted leads' PII and is CRM/Sales-internal.
@router.get("", response_model=list[ConsultationRequestRead])
async def list_requests(
    skip: int = 0,
    limit: int = 100,
    service: ConsultationRequestService = Depends(get_consultation_service),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("crm", "sales")),
):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=ConsultationRequestRead)
async def get_request(
    id: uuid.UUID,
    service: ConsultationRequestService = Depends(get_consultation_service),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("crm", "sales")),
):
    return await service.get(id)


@router.post("", response_model=ConsultationRequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(
    data: ConsultationRequestCreate,
    service: ConsultationRequestService = Depends(get_consultation_service),
):
    result = await service.create(data)
    await service._session.commit()
    return result


@router.put("/{id}", response_model=ConsultationRequestRead)
async def update_request(
    id: uuid.UUID,
    data: ConsultationRequestUpdate,
    service: ConsultationRequestService = Depends(get_consultation_service),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("crm", "sales")),
):
    result = await service.update(id, data)
    await service._session.commit()
    return result


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    id: uuid.UUID,
    service: ConsultationRequestService = Depends(get_consultation_service),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("crm", "sales")),
):
    await service.delete(id)
    await service._session.commit()
