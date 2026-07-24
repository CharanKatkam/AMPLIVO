"""Routes for the Timesheets module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.timesheets.dependencies import get_timesheet_service
from app.modules.timesheets.schemas import TimesheetCreate, TimesheetRead, TimesheetUpdate
from app.modules.timesheets.service import TimesheetService

router = APIRouter(prefix="/timesheets", tags=["Timesheets"])


@router.get("", response_model=list[TimesheetRead])
async def list_timesheets(skip: int = 0, limit: int = 100, service: TimesheetService = Depends(get_timesheet_service), _: User = Depends(get_current_user)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=TimesheetRead)
async def get_timesheet(id: uuid.UUID, service: TimesheetService = Depends(get_timesheet_service), _: User = Depends(get_current_user)):
    return await service.get(id)


@router.post("", response_model=TimesheetRead, status_code=status.HTTP_201_CREATED)
async def create_timesheet(data: TimesheetCreate, db: AsyncSession = Depends(get_db), service: TimesheetService = Depends(get_timesheet_service), _: User = Depends(get_current_user)):
    # NOTE: this router previously never called db.commit() anywhere, so every
    # write silently rolled back at request end (confirmed pre-existing, not
    # introduced here) — every mutating route now commits explicitly.
    obj = await service.create(data); await db.commit()
    return obj


@router.put("/{id}", response_model=TimesheetRead)
async def update_timesheet(id: uuid.UUID, data: TimesheetUpdate, db: AsyncSession = Depends(get_db), service: TimesheetService = Depends(get_timesheet_service), _: User = Depends(get_current_user)):
    obj = await service.update(id, data); await db.commit()
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_timesheet(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: TimesheetService = Depends(get_timesheet_service), _: User = Depends(get_current_user)):
    await service.delete(id); await db.commit()
