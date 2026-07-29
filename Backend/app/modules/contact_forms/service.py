"""Service for the Contact Forms module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact_forms.models import ContactSubmission
from app.modules.contact_forms.repository import ContactSubmissionRepository
from app.modules.contact_forms.schemas import ContactSubmissionCreate, ContactSubmissionUpdate
from app.modules.leads.repository import LeadRepository
from app.core import lead_pipeline
from app.core.exceptions import NotFoundException
from app.utils.sales_events import log_activity, notify_role


class ContactSubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ContactSubmissionRepository(session)
        self._lead_repo = LeadRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ContactSubmission]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ContactSubmission:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("ContactSubmission")
        return obj

    async def create(self, data: ContactSubmissionCreate) -> ContactSubmission:
        submission = await self._repo.create_from_dict(data.model_dump())
        
        # Automatically create a Lead in CRM
        notes = data.message or ""
        if data.subject:
            notes = f"Subject: {data.subject}\n\n" + notes
            
        lead_data = {
            "title": f"Contact Form: {data.name} - {data.company or 'Individual'}",
            "contact_name": data.name,
            "company_name": data.company,
            "email": data.email,
            "phone": data.phone,
            "status": lead_pipeline.NEW_LEAD,
            "priority": "Medium",
            "notes": notes.strip(),
        }
        lead = await self._lead_repo.create_from_dict(lead_data)
        submission.converted_lead_id = lead.id
        await self._session.flush()
        await self._session.refresh(submission)

        # This path creates the Lead directly via the repository rather than
        # LeadService.create_lead(), so it must raise its own notification -
        # otherwise a brand-new public enquiry silently reaches no one on the
        # sales team until someone happens to open the Leads page.
        await notify_role(
            self._session, "sales",
            title="New enquiry received",
            message=f"{data.name} ({data.company or 'Individual'}) submitted a contact form enquiry."
            + (f" Subject: {data.subject}." if data.subject else ""),
        )
        await log_activity(
            self._session, user_id=None, entity_type="lead", entity_id=lead.id,
            action="lead_created", description=f"Lead '{lead.title}' created from a contact form submission.",
        )

        return submission

    async def update(self, id: uuid.UUID, data: ContactSubmissionUpdate) -> ContactSubmission:
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException("ContactSubmission")
        return updated

    async def delete(self, id: uuid.UUID) -> None:
        if not await self._repo.delete(id):
            raise NotFoundException("ContactSubmission")
