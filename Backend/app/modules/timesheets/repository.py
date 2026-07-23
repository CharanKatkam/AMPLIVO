"""Repository for the Timesheets module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.timesheets.models import Timesheet


class TimesheetRepository(BaseRepository[Timesheet]):
    model = Timesheet

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
