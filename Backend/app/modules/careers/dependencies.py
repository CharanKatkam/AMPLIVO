"""Dependencies for the Careers module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.careers.service import InterviewService, JobOpeningService, OfferService


def get_career_service(db: AsyncSession = Depends(get_db)) -> JobOpeningService:
    return JobOpeningService(db)


def get_interview_service(db: AsyncSession = Depends(get_db)) -> InterviewService:
    return InterviewService(db)


def get_offer_service(db: AsyncSession = Depends(get_db)) -> OfferService:
    return OfferService(db)
