"""Service for the Consultation Requests module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.consultation_requests.models import ConsultationRequest
from app.modules.consultation_requests.repository import ConsultationRequestRepository
from app.modules.consultation_requests.schemas import ConsultationRequestCreate, ConsultationRequestUpdate
from app.core.exceptions import NotFoundException


class ConsultationRequestService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ConsultationRequestRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ConsultationRequest]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ConsultationRequest:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        return obj

    async def create(self, data: ConsultationRequestCreate) -> ConsultationRequest:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: ConsultationRequestUpdate) -> ConsultationRequest:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        await self._repo.update(obj, data.model_dump(exclude_unset=True))
        return await self._repo.get_by_id(id)

    async def delete(self, id: uuid.UUID) -> None:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        await self._repo.delete(obj.id)
