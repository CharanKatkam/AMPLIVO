"""API routes for Notifications."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.notifications.dependencies import *
from app.modules.notifications.schemas import *
from app.modules.notifications.service import *

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# ── Templates ──
@router.get("/templates", response_model=list[NotificationTemplateRead], summary="List notification templates")
async def list_templates(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    svc: NotificationTemplateService = Depends(get_notification_template_service),
    _: User = Depends(get_current_user),
):
    return [NotificationTemplateRead.model_validate(x) for x in await svc.list_templates(offset=offset, limit=limit)]

@router.post("/templates", response_model=NotificationTemplateRead, status_code=status.HTTP_201_CREATED, summary="Create notification template")
async def create_template(payload: NotificationTemplateCreate, db: AsyncSession = Depends(get_db), svc: NotificationTemplateService = Depends(get_notification_template_service), _: User = Depends(get_current_user)):
    t = await svc.create_template(payload.model_dump()); await db.commit()
    return NotificationTemplateRead.model_validate(t)

@router.get("/templates/{template_id}", response_model=NotificationTemplateRead, summary="Get notification template")
async def get_template(template_id: uuid.UUID, svc: NotificationTemplateService = Depends(get_notification_template_service), _: User = Depends(get_current_user)):
    return NotificationTemplateRead.model_validate(await svc.get_template(template_id))

@router.put("/templates/{template_id}", response_model=NotificationTemplateRead, summary="Update notification template")
async def update_template(template_id: uuid.UUID, payload: NotificationTemplateUpdate, db: AsyncSession = Depends(get_db), svc: NotificationTemplateService = Depends(get_notification_template_service), _: User = Depends(get_current_user)):
    t = await svc.update_template(template_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return NotificationTemplateRead.model_validate(t)

@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete notification template")
async def delete_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: NotificationTemplateService = Depends(get_notification_template_service), _: User = Depends(get_current_user)):
    await svc.delete_template(template_id); await db.commit()

# ── Notifications ──
@router.get("", response_model=PaginatedResponse[NotificationRead], summary="List notifications")
async def list_notifications(
    params: PaginationParams = Depends(),
    is_read: bool | None = Query(None),
    channel: str | None = Query(None),
    svc: NotificationService = Depends(get_notification_service),
    current_user: User = Depends(get_current_user),
):
    # Only list notifications for the current user
    items, total = await svc.list_notifications(
        search=params.search, user_id=current_user.id, is_read=is_read, channel=channel,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[NotificationRead].create(items=[NotificationRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED, summary="Send notification")
async def send_notification(payload: NotificationCreate, db: AsyncSession = Depends(get_db), svc: NotificationService = Depends(get_notification_service), _: User = Depends(get_current_user)):
    n = await svc.create_notification(payload.model_dump()); await db.commit()
    return NotificationRead.model_validate(n)

@router.get("/{notification_id}", response_model=NotificationRead, summary="Get notification")
async def get_notification(notification_id: uuid.UUID, svc: NotificationService = Depends(get_notification_service), current_user: User = Depends(get_current_user)):
    return NotificationRead.model_validate(await svc.get_notification(notification_id, current_user_id=current_user.id))

@router.put("/{notification_id}/read", response_model=NotificationRead, summary="Mark notification as read")
async def mark_notification_as_read(notification_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: NotificationService = Depends(get_notification_service), current_user: User = Depends(get_current_user)):
    n = await svc.mark_as_read(notification_id, current_user_id=current_user.id); await db.commit()
    return NotificationRead.model_validate(n)

@router.put("/read-all", status_code=status.HTTP_200_OK, summary="Mark all notifications as read")
async def mark_all_notifications_as_read(db: AsyncSession = Depends(get_db), svc: NotificationService = Depends(get_notification_service), current_user: User = Depends(get_current_user)):
    count = await svc.mark_all_as_read(current_user.id); await db.commit()
    return {"message": f"{count} notifications marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete notification")
async def delete_notification(notification_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: NotificationService = Depends(get_notification_service), current_user: User = Depends(get_current_user)):
    await svc.delete_notification(notification_id, current_user_id=current_user.id); await db.commit()
