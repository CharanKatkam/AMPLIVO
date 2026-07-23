"""Dependencies for the Timesheets module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.timesheets.service import TimesheetService


def get_timesheet_service(db: AsyncSession = Depends(get_db)) -> TimesheetService:
    return TimesheetService(db)
