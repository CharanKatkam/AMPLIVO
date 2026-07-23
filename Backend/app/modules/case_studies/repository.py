"""Repository for the Case Studies module."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.modules.case_studies.models import CaseStudy, CaseStudyMetric


class CaseStudyMetricRepository(BaseRepository[CaseStudyMetric]):
    model = CaseStudyMetric

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class CaseStudyRepository(BaseRepository[CaseStudy]):
    model = CaseStudy

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_all_detailed(self, offset: int = 0, limit: int = 100) -> Sequence[CaseStudy]:
        stmt = select(self.model).options(selectinload(self.model.metrics)).offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()

    async def get_detail(self, id: uuid.UUID) -> CaseStudy | None:
        stmt = select(self.model).options(selectinload(self.model.metrics)).where(self.model.id == id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> CaseStudy | None:
        stmt = select(self.model).options(selectinload(self.model.metrics)).where(self.model.slug == slug)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

