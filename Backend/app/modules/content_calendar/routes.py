"""Routes for the Content Calendar module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.content_calendar.dependencies import get_content_calendar_service
from app.modules.content_calendar.schemas import ContentCalendarEntryCreate, ContentCalendarEntryRead, ContentCalendarEntryUpdate
from app.modules.content_calendar.service import ContentCalendarEntryService

router = APIRouter(prefix="/content-calendar", tags=["Content Calendar"])


@router.get("", response_model=list[ContentCalendarEntryRead])
async def list_entries(
    skip: int = 0, limit: int = 100,
    client_id: uuid.UUID | None = Query(None),
    service: ContentCalendarEntryService = Depends(get_content_calendar_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    return await service.list_all(client_id=effective_client_id, skip=skip, limit=limit)


@router.get("/{id}", response_model=ContentCalendarEntryRead)
async def get_entry(id: uuid.UUID, service: ContentCalendarEntryService = Depends(get_content_calendar_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return await service.get(id, scoped_client_id=scoped_client_id)


@router.post("", response_model=ContentCalendarEntryRead, status_code=status.HTTP_201_CREATED)
async def create_entry(data: ContentCalendarEntryCreate, db: AsyncSession = Depends(get_db), service: ContentCalendarEntryService = Depends(get_content_calendar_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    payload = data.model_dump()
    if scoped_client_id is not None:
        payload["client_id"] = scoped_client_id
    payload["created_by"] = current_user.id
    entry = await service.create(ContentCalendarEntryCreate(**payload))
    await db.commit()
    return entry


@router.put("/{id}", response_model=ContentCalendarEntryRead)
async def update_entry(id: uuid.UUID, data: ContentCalendarEntryUpdate, db: AsyncSession = Depends(get_db), service: ContentCalendarEntryService = Depends(get_content_calendar_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    entry = await service.update(id, data, scoped_client_id=scoped_client_id)
    await db.commit()
    return entry


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: ContentCalendarEntryService = Depends(get_content_calendar_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await service.delete(id, scoped_client_id=scoped_client_id)
    await db.commit()
