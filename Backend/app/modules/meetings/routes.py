"""API routes for Sales Meetings."""
from __future__ import annotations
import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.rbac import require_roles
from app.models.user import User
from app.modules.meetings.dependencies import get_meeting_service
from app.modules.meetings.schemas import MeetingCancelRequest, MeetingCompleteRequest, MeetingCreate, MeetingRead, MeetingRescheduleRequest, MeetingUpdate
from app.modules.meetings.service import MeetingService

router = APIRouter(prefix="/meetings", tags=["Sales — Meetings"])


@router.get("", response_model=PaginatedResponse[MeetingRead], summary="List meetings")
async def list_meetings(
    params: PaginationParams = Depends(),
    lead_id: uuid.UUID | None = Query(None),
    meeting_status: str | None = Query(None, alias="status"),
    assigned_to: uuid.UUID | None = Query(None),
    on_date: date | None = Query(None),
    svc: MeetingService = Depends(get_meeting_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_meetings(
        search=params.search, lead_id=lead_id, status=meeting_status, assigned_to=assigned_to, on_date=on_date,
        sort_by=params.sort_by, sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[MeetingRead].create(
        items=[MeetingRead.model_validate(m) for m in items], total=total, page=params.page, page_size=params.page_size,
    )


@router.post("", response_model=MeetingRead, status_code=status.HTTP_201_CREATED, summary="Schedule meeting")
async def create_meeting(
    payload: MeetingCreate, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service),
    current_user: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    meeting = await svc.create_meeting(payload.model_dump(), created_by=current_user.id)
    await db.commit()
    return MeetingRead.model_validate(meeting)


@router.get("/{meeting_id}", response_model=MeetingRead, summary="Get meeting")
async def get_meeting(meeting_id: uuid.UUID, svc: MeetingService = Depends(get_meeting_service), _: User = Depends(get_current_user)):
    return MeetingRead.model_validate(await svc.get_meeting(meeting_id))


@router.put("/{meeting_id}", response_model=MeetingRead, summary="Update meeting")
async def update_meeting(
    meeting_id: uuid.UUID, payload: MeetingUpdate, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service), _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    meeting = await svc.update_meeting(meeting_id, payload.model_dump(exclude_unset=True))
    await db.commit()
    return MeetingRead.model_validate(meeting)


@router.patch("/{meeting_id}/reschedule", response_model=MeetingRead, summary="Reschedule meeting")
async def reschedule_meeting(
    meeting_id: uuid.UUID, payload: MeetingRescheduleRequest, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service), current_user: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    meeting = await svc.reschedule_meeting(meeting_id, new_time=payload.scheduled_at, reason=payload.reason, actor_id=current_user.id)
    await db.commit()
    return MeetingRead.model_validate(meeting)


@router.post("/{meeting_id}/cancel", response_model=MeetingRead, summary="Cancel meeting (soft - keeps the record)")
async def cancel_meeting(
    meeting_id: uuid.UUID, payload: MeetingCancelRequest, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service), current_user: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    meeting = await svc.cancel_meeting(meeting_id, reason=payload.reason, actor_id=current_user.id)
    await db.commit()
    return MeetingRead.model_validate(meeting)


@router.post("/{meeting_id}/complete", response_model=MeetingRead, summary="Mark meeting as completed")
async def complete_meeting(
    meeting_id: uuid.UUID, payload: MeetingCompleteRequest, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service), current_user: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    meeting = await svc.complete_meeting(
        meeting_id, notes=payload.notes, follow_up_required=payload.follow_up_required, actor_id=current_user.id,
    )
    await db.commit()
    return MeetingRead.model_validate(meeting)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Cancel/delete meeting")
async def delete_meeting(
    meeting_id: uuid.UUID, db: AsyncSession = Depends(get_db),
    svc: MeetingService = Depends(get_meeting_service), _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("sales")),
):
    await svc.delete_meeting(meeting_id)
    await db.commit()
