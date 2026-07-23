"""Repository layer for SEO."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.seo.models import SeoAudit, SeoBacklink, SeoKeyword, SeoProject
from app.repositories.base import BaseRepository

class SeoProjectRepository(BaseRepository[SeoProject]):
    model = SeoProject
    searchable_columns = [SeoProject.name, SeoProject.target_url]
    async def get_detail(self, project_id: uuid.UUID) -> SeoProject | None:
        stmt = select(SeoProject).options(selectinload(SeoProject.keywords), selectinload(SeoProject.audits), selectinload(SeoProject.backlinks)).where(SeoProject.id == project_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[SeoProject]:
        stmt = select(SeoProject)
        if client_id: stmt = stmt.where(SeoProject.client_id == client_id)
        if status: stmt = stmt.where(SeoProject.status == status)
        if manager_id: stmt = stmt.where(SeoProject.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=SeoProject, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, status=None, manager_id=None) -> int:
        stmt = select(func.count()).select_from(SeoProject)
        if client_id: stmt = stmt.where(SeoProject.client_id == client_id)
        if status: stmt = stmt.where(SeoProject.status == status)
        if manager_id: stmt = stmt.where(SeoProject.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class SeoKeywordRepository(BaseRepository[SeoKeyword]):
    model = SeoKeyword
    searchable_columns = [SeoKeyword.keyword, SeoKeyword.url]
    async def list_by_project(self, project_id: uuid.UUID) -> Sequence[SeoKeyword]:
        r = await self._db.execute(select(SeoKeyword).where(SeoKeyword.project_id == project_id).order_by(SeoKeyword.keyword))
        return r.scalars().all()

class SeoAuditRepository(BaseRepository[SeoAudit]):
    model = SeoAudit
    async def list_by_project(self, project_id: uuid.UUID) -> Sequence[SeoAudit]:
        r = await self._db.execute(select(SeoAudit).where(SeoAudit.project_id == project_id).order_by(SeoAudit.audit_date.desc()))
        return r.scalars().all()

class SeoBacklinkRepository(BaseRepository[SeoBacklink]):
    model = SeoBacklink
    searchable_columns = [SeoBacklink.source_url, SeoBacklink.target_url]
    async def list_by_project(self, project_id: uuid.UUID) -> Sequence[SeoBacklink]:
        r = await self._db.execute(select(SeoBacklink).where(SeoBacklink.project_id == project_id).order_by(SeoBacklink.created_at.desc()))
        return r.scalars().all()
