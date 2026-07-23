"""Routes for the Timesheets module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.timesheets.dependencies import get_timesheet_service
from app.modules.timesheets.schemas import TimesheetCreate, TimesheetRead, TimesheetUpdate
from app.modules.timesheets.service import TimesheetService

router = APIRouter(prefix="/timesheets", tags=["Timesheets"])


@router.get("", response_model=list[TimesheetRead])
async def list_timesheets(skip: int = 0, limit: int = 100, service: TimesheetService = Depends(get_timesheet_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=TimesheetRead)
async def get_timesheet(id: uuid.UUID, service: TimesheetService = Depends(get_timesheet_service)):
    return await service.get(id)


@router.post("", response_model=TimesheetRead, status_code=status.HTTP_201_CREATED)
async def create_timesheet(data: TimesheetCreate, service: TimesheetService = Depends(get_timesheet_service)):
    return await service.create(data)


@router.put("/{id}", response_model=TimesheetRead)
async def update_timesheet(id: uuid.UUID, data: TimesheetUpdate, service: TimesheetService = Depends(get_timesheet_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_timesheet(id: uuid.UUID, service: TimesheetService = Depends(get_timesheet_service)):
    await service.delete(id)
