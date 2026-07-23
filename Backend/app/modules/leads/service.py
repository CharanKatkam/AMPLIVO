"""Service layer for Lead Management."""
from __future__ import annotations
import uuid
from typing import Any, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import BadRequestException, DuplicateException, NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.leads.models import Lead, LeadActivity, LeadFollowup, LeadSource, SalesPipeline
from app.modules.leads.repository import (
    LeadActivityRepository, LeadFollowupRepository, LeadRepository,
    LeadSourceRepository, SalesPipelineRepository,
)
from app.utils.time import utc_now


class LeadSourceService:
    def __init__(self, repo: LeadSourceRepository) -> None:
        self._repo = repo
    async def list_sources(self, *, search=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all(search=search, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count(search=search)
        return items, total
    async def get_source(self, source_id: uuid.UUID) -> LeadSource:
        s = await self._repo.get_by_id(source_id)
        if s is None: raise NotFoundException("LeadSource")
        return s
    async def create_source(self, data: dict) -> LeadSource:
        if await self._repo.get_by_slug(data["slug"]): raise DuplicateException("LeadSource", "slug")
        return await self._repo.create_from_dict(data)
    async def update_source(self, source_id: uuid.UUID, data: dict) -> LeadSource:
        updated = await self._repo.update(source_id, data)
        if updated is None: raise NotFoundException("LeadSource")
        return updated
    async def delete_source(self, source_id: uuid.UUID) -> None:
        if not await self._repo.delete(source_id): raise NotFoundException("LeadSource")


class LeadService:
    def __init__(self, db: AsyncSession, repo: LeadRepository, activity_repo: LeadActivityRepository) -> None:
        self._db = db; self._repo = repo; self._activity_repo = activity_repo
    async def list_leads(self, *, search=None, status=None, priority=None, source_id=None,
                         assigned_to=None, client_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(
            search=search, status=status, priority=priority, source_id=source_id,
            assigned_to=assigned_to, client_id=client_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit,
        )
        total = await self._repo.count_filtered(
            search=search, status=status, priority=priority, source_id=source_id,
            assigned_to=assigned_to, client_id=client_id,
        )
        return items, total
    async def get_lead(self, lead_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Lead:
        lead = await self._repo.get_by_id(lead_id)
        if lead is None: raise NotFoundException("Lead")
        enforce_client_scope(lead.client_id, scoped_client_id)
        return lead
    async def create_lead(self, data: dict, created_by: uuid.UUID | None = None) -> Lead:
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)
    async def update_lead(self, lead_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> Lead:
        await self.get_lead(lead_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(lead_id, data)
        if updated is None: raise NotFoundException("Lead")
        return updated
    async def delete_lead(self, lead_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_lead(lead_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(lead_id): raise NotFoundException("Lead")
    async def convert_lead(self, lead_id: uuid.UUID, client_id: uuid.UUID) -> Lead:
        lead = await self.get_lead(lead_id)
        if lead.status == "converted": raise BadRequestException("Lead is already converted.")
        lead.status = "converted"
        lead.converted_client_id = client_id
        lead.converted_at = utc_now()
        await self._db.flush()
        await self._db.refresh(lead)
        return lead


class LeadActivityService:
    def __init__(self, db: AsyncSession, repo: LeadActivityRepository) -> None:
        self._db = db; self._repo = repo
    async def list_activities(self, lead_id: uuid.UUID) -> Sequence[LeadActivity]:
        return await self._repo.list_by_lead(lead_id)
    async def create_activity(self, lead_id: uuid.UUID, data: dict, performed_by: uuid.UUID | None = None) -> LeadActivity:
        data["lead_id"] = lead_id; data["performed_by"] = performed_by
        return await self._repo.create_from_dict(data)


class LeadFollowupService:
    def __init__(self, db: AsyncSession, repo: LeadFollowupRepository) -> None:
        self._db = db; self._repo = repo
    async def list_followups(self, lead_id: uuid.UUID) -> Sequence[LeadFollowup]:
        return await self._repo.list_by_lead(lead_id)
    async def create_followup(self, lead_id: uuid.UUID, data: dict) -> LeadFollowup:
        data["lead_id"] = lead_id
        return await self._repo.create_from_dict(data)
    async def update_followup(self, followup_id: uuid.UUID, data: dict) -> LeadFollowup:
        updated = await self._repo.update(followup_id, data)
        if updated is None: raise NotFoundException("LeadFollowup")
        return updated
    async def delete_followup(self, followup_id: uuid.UUID) -> None:
        if not await self._repo.delete(followup_id): raise NotFoundException("LeadFollowup")


class SalesPipelineService:
    def __init__(self, repo: SalesPipelineRepository) -> None:
        self._repo = repo
    async def list_stages(self, *, search=None, sort_by=None, sort_order="asc", offset=0, limit=50):
        items = await self._repo.get_all(search=search, sort_by=sort_by or "order", sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count(search=search)
        return items, total
    async def create_stage(self, data: dict) -> SalesPipeline:
        return await self._repo.create_from_dict(data)
    async def update_stage(self, stage_id: uuid.UUID, data: dict) -> SalesPipeline:
        updated = await self._repo.update(stage_id, data)
        if updated is None: raise NotFoundException("SalesPipeline")
        return updated
    async def delete_stage(self, stage_id: uuid.UUID) -> None:
        if not await self._repo.delete(stage_id): raise NotFoundException("SalesPipeline")
