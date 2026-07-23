"""Service for the Companies module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.companies.models import Company
from app.modules.companies.repository import CompanyRepository
from app.modules.companies.schemas import CompanyCreate, CompanyUpdate
from app.core.exceptions import NotFoundException


class CompanyService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = CompanyRepository(session)

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[Company]:
        return await self._repo.get_all(offset=skip, limit=limit)

    async def get(self, id: uuid.UUID) -> Company:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("Company")
        return obj

    async def create(self, data: CompanyCreate) -> Company:
        return await self._repo.create_from_dict(data.model_dump())

    async def update(self, id: uuid.UUID, data: CompanyUpdate) -> Company:
        updated = await self._repo.update(id, data.model_dump(exclude_unset=True))
        if updated is None:
            raise NotFoundException("Company")
        return updated

    async def delete(self, id: uuid.UUID) -> None:
        if not await self._repo.delete(id):
            raise NotFoundException("Company")
