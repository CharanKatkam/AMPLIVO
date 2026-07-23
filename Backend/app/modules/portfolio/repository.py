"""Repository for the Portfolio module."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.portfolio.models import PortfolioItem


class PortfolioItemRepository(BaseRepository[PortfolioItem]):
    model = PortfolioItem

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_slug(self, slug: str) -> PortfolioItem | None:
        stmt = select(self.model).where(self.model.slug == slug)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
