"""Dependencies for the Consultation Requests module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.consultation_requests.service import ConsultationRequestService


def get_consultation_service(db: AsyncSession = Depends(get_db)) -> ConsultationRequestService:
    return ConsultationRequestService(db)
