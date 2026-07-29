"""Repository for the Consultation Requests module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.consultation_requests.models import ConsultationRequest


class ConsultationRequestRepository(BaseRepository[ConsultationRequest]):
    model = ConsultationRequest

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
