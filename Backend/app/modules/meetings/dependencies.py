"""DI factories for the Meetings module."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.meetings.repository import MeetingRepository
from app.modules.meetings.service import MeetingService


def get_meeting_service(db: AsyncSession = Depends(get_db)) -> MeetingService:
    return MeetingService(db, MeetingRepository(db))
