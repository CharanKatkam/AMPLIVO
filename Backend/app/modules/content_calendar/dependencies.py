"""Dependencies for the Content Calendar module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.content_calendar.service import ContentCalendarEntryService


def get_content_calendar_service(db: AsyncSession = Depends(get_db)) -> ContentCalendarEntryService:
    return ContentCalendarEntryService(db)
