"""Service for the Content Calendar module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.content_calendar.models import ContentCalendarEntry
from app.modules.content_calendar.repository import ContentCalendarEntryRepository
from app.modules.content_calendar.schemas import ContentCalendarEntryCreate, ContentCalendarEntryUpdate
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope


class ContentCalendarEntryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ContentCalendarEntryRepository(session)

    async def list_all(self, *, client_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[ContentCalendarEntry]:
        return list(await self._repo.get_all_filtered(client_id=client_id, offset=skip, limit=limit))

    async def get(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> ContentCalendarEntry:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("ContentCalendarEntry")
        enforce_client_scope(obj.client_id, scoped_client_id)
        return obj

    async def create(self, data: ContentCalendarEntryCreate) -> ContentCalendarEntry:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: ContentCalendarEntryUpdate, *, scoped_client_id: uuid.UUID | None = None) -> ContentCalendarEntry:
        await self.get(id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException("ContentCalendarEntry")
        return updated

    async def delete(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get(id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(id):
            raise NotFoundException("ContentCalendarEntry")
