"""Service layer for SEO."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.seo.models import SeoAudit, SeoBacklink, SeoKeyword, SeoProject
from app.modules.seo.repository import SeoAuditRepository, SeoBacklinkRepository, SeoKeywordRepository, SeoProjectRepository

class SeoProjectService:
    def __init__(self, repo: SeoProjectRepository) -> None:
        self._repo = repo
    async def list_projects(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id)
        return items, total
    async def get_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> SeoProject:
        p = await self._repo.get_detail(project_id)
        if p is None: raise NotFoundException("SeoProject")
        enforce_client_scope(p.client_id, scoped_client_id)
        return p
    async def create_project(self, data: dict) -> SeoProject:
        return await self._repo.create_from_dict(data)
    async def update_project(self, project_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> SeoProject:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(project_id, data)
        if updated is None: raise NotFoundException("SeoProject")
        return updated
    async def delete_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(project_id): raise NotFoundException("SeoProject")

class SeoKeywordService:
    def __init__(self, repo: SeoKeywordRepository) -> None:
        self._repo = repo
    async def list_keywords(self, project_id: uuid.UUID) -> Sequence[SeoKeyword]:
        return await self._repo.list_by_project(project_id)
    async def create_keyword(self, project_id: uuid.UUID, data: dict) -> SeoKeyword:
        data["project_id"] = project_id
        return await self._repo.create_from_dict(data)
    async def update_keyword(self, keyword_id: uuid.UUID, data: dict) -> SeoKeyword:
        updated = await self._repo.update(keyword_id, data)
        if updated is None: raise NotFoundException("SeoKeyword")
        return updated
    async def delete_keyword(self, keyword_id: uuid.UUID) -> None:
        if not await self._repo.delete(keyword_id): raise NotFoundException("SeoKeyword")

class SeoAuditService:
    def __init__(self, repo: SeoAuditRepository) -> None:
        self._repo = repo
    async def list_audits(self, project_id: uuid.UUID) -> Sequence[SeoAudit]:
        return await self._repo.list_by_project(project_id)
    async def create_audit(self, project_id: uuid.UUID, data: dict, conducted_by: uuid.UUID | None = None) -> SeoAudit:
        data["project_id"] = project_id; data["conducted_by"] = conducted_by
        return await self._repo.create_from_dict(data)
    async def update_audit(self, audit_id: uuid.UUID, data: dict) -> SeoAudit:
        updated = await self._repo.update(audit_id, data)
        if updated is None: raise NotFoundException("SeoAudit")
        return updated
    async def delete_audit(self, audit_id: uuid.UUID) -> None:
        if not await self._repo.delete(audit_id): raise NotFoundException("SeoAudit")

class SeoBacklinkService:
    def __init__(self, repo: SeoBacklinkRepository) -> None:
        self._repo = repo
    async def list_backlinks(self, project_id: uuid.UUID) -> Sequence[SeoBacklink]:
        return await self._repo.list_by_project(project_id)
    async def create_backlink(self, project_id: uuid.UUID, data: dict) -> SeoBacklink:
        data["project_id"] = project_id
        return await self._repo.create_from_dict(data)
    async def update_backlink(self, backlink_id: uuid.UUID, data: dict) -> SeoBacklink:
        updated = await self._repo.update(backlink_id, data)
        if updated is None: raise NotFoundException("SeoBacklink")
        return updated
    async def delete_backlink(self, backlink_id: uuid.UUID) -> None:
        if not await self._repo.delete(backlink_id): raise NotFoundException("SeoBacklink")
