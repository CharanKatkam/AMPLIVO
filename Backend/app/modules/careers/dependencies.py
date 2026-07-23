"""Dependencies for the Careers module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.careers.service import JobOpeningService


def get_career_service(db: AsyncSession = Depends(get_db)) -> JobOpeningService:
    return JobOpeningService(db)
