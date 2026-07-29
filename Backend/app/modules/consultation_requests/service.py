"""Service for the Consultation Requests module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.consultation_requests.models import ConsultationRequest
from app.modules.consultation_requests.repository import ConsultationRequestRepository
from app.modules.consultation_requests.schemas import ConsultationRequestCreate, ConsultationRequestUpdate
from app.modules.leads.repository import LeadRepository
from app.core import lead_pipeline
from app.core.exceptions import NotFoundException


class ConsultationRequestService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ConsultationRequestRepository(session)
        self._lead_repo = LeadRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ConsultationRequest]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ConsultationRequest:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        return obj

    async def create(self, data: ConsultationRequestCreate) -> ConsultationRequest:
        consultation = await self._repo.create_from_dict(data.model_dump())
        
        # Automatically create a Lead in CRM
        interested_services = []
        if data.service_interest:
            interested_services.append(data.service_interest)
            
        notes = data.message or ""
        if data.budget_range:
            notes += f"\n\nBudget: {data.budget_range}"
            
        lead_data = {
            "title": f"Consultation: {data.name} - {data.company or 'Individual'}",
            "contact_name": data.name,
            "company_name": data.company,
            "email": data.email,
            "phone": data.phone,
            "status": lead_pipeline.NEW_LEAD,
            "priority": "Medium",
            "notes": notes.strip(),
            "interested_services": interested_services,
        }
        await self._lead_repo.create_from_dict(lead_data)
        
        return consultation

    async def update(self, id: uuid.UUID, data: ConsultationRequestUpdate) -> ConsultationRequest:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        await self._repo.update(obj.id, data.model_dump(exclude_unset=True))
        return await self._repo.get_by_id(id)

    async def delete(self, id: uuid.UUID) -> None:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException(detail="Consultation request not found")
        await self._repo.delete(obj.id)
