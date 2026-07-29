"""Repository for the Companies module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.companies.models import Company


class CompanyRepository(BaseRepository[Company]):
    model = Company

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
