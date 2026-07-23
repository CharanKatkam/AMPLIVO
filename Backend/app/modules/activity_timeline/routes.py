"""Routes for the Activity Timeline module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.activity_timeline.dependencies import get_activity_log_service
from app.modules.activity_timeline.schemas import ActivityLogCreate, ActivityLogRead
from app.modules.activity_timeline.service import ActivityLogService

router = APIRouter(prefix="/activity-logs", tags=["Activity Timeline"])


@router.get("", response_model=list[ActivityLogRead])
async def list_logs(skip: int = 0, limit: int = 100, service: ActivityLogService = Depends(get_activity_log_service), _: User = Depends(get_current_user)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=ActivityLogRead)
async def get_log(id: uuid.UUID, service: ActivityLogService = Depends(get_activity_log_service), _: User = Depends(get_current_user)):
    return await service.get(id)


@router.post("", response_model=ActivityLogRead, status_code=status.HTTP_201_CREATED)
async def create_log(data: ActivityLogCreate, db: AsyncSession = Depends(get_db), service: ActivityLogService = Depends(get_activity_log_service), _: User = Depends(get_current_user)):
    log = await service.create(data)
    await db.commit()
    return log


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: ActivityLogService = Depends(get_activity_log_service), _: User = Depends(get_current_user)):
    await service.delete(id)
    await db.commit()
