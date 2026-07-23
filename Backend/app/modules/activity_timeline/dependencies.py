"""Dependencies for the Activity Timeline module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.activity_timeline.service import ActivityLogService


def get_activity_log_service(db: AsyncSession = Depends(get_db)) -> ActivityLogService:
    return ActivityLogService(db)
