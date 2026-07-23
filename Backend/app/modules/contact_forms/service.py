"""Service for the Contact Forms module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact_forms.models import ContactSubmission
from app.modules.contact_forms.repository import ContactSubmissionRepository
from app.modules.contact_forms.schemas import ContactSubmissionCreate, ContactSubmissionUpdate
from app.core.exceptions import NotFoundException


class ContactSubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ContactSubmissionRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[ContactSubmission]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> ContactSubmission:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("ContactSubmission")
        return obj

    async def create(self, data: ContactSubmissionCreate) -> ContactSubmission:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: ContactSubmissionUpdate) -> ContactSubmission:
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException("ContactSubmission")
        return updated

    async def delete(self, id: uuid.UUID) -> None:
        if not await self._repo.delete(id):
            raise NotFoundException("ContactSubmission")
