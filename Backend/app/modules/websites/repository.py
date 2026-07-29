"""Repository layer for Websites."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.websites.models import Website, WebsiteMetric, WebsitePage
from app.repositories.base import BaseRepository

class WebsiteRepository(BaseRepository[Website]):
    model = Website
    searchable_columns = [Website.name, Website.domain]
    async def get_detail(self, website_id: uuid.UUID) -> Website | None:
        stmt = select(Website).options(selectinload(Website.pages), selectinload(Website.metrics)).where(Website.id == website_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Website]:
        stmt = select(Website)
        if client_id: stmt = stmt.where(Website.client_id == client_id)
        if status: stmt = stmt.where(Website.status == status)
        if manager_id: stmt = stmt.where(Website.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Website, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, status=None, manager_id=None) -> int:
        stmt = select(func.count()).select_from(Website)
        if client_id: stmt = stmt.where(Website.client_id == client_id)
        if status: stmt = stmt.where(Website.status == status)
        if manager_id: stmt = stmt.where(Website.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class WebsitePageRepository(BaseRepository[WebsitePage]):
    model = WebsitePage
    searchable_columns = [WebsitePage.title, WebsitePage.url_path]
    async def list_by_website(self, website_id: uuid.UUID) -> Sequence[WebsitePage]:
        r = await self._db.execute(select(WebsitePage).where(WebsitePage.website_id == website_id).order_by(WebsitePage.url_path))
        return r.scalars().all()

class WebsiteMetricRepository(BaseRepository[WebsiteMetric]):
    model = WebsiteMetric
    async def list_by_website(self, website_id: uuid.UUID) -> Sequence[WebsiteMetric]:
        r = await self._db.execute(select(WebsiteMetric).where(WebsiteMetric.website_id == website_id).order_by(WebsiteMetric.date.desc()))
        return r.scalars().all()
