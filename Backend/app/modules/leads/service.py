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
from app.utils.sales_events import log_activity, notify_role, notify_users
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
        lead = await self._repo.create_from_dict(data)
        if lead.assigned_to:
            await notify_users(
                self._db, [lead.assigned_to],
                title="New lead assigned to you",
                message=f"'{lead.title}'" + (f" ({lead.company_name})" if lead.company_name else "") + " has been assigned to you.",
            )
        await log_activity(
            self._db, user_id=created_by, entity_type="lead", entity_id=lead.id,
            action="lead_created", description=f"Lead '{lead.title}' created.",
        )
        return lead
    async def update_lead(self, lead_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None, actor_id: uuid.UUID | None = None) -> Lead:
        existing = await self.get_lead(lead_id, scoped_client_id=scoped_client_id)
        old_status = existing.status
        old_assigned_to = existing.assigned_to
        updated = await self._repo.update(lead_id, data)
        if updated is None: raise NotFoundException("Lead")

        new_assigned_to = data.get("assigned_to")
        if new_assigned_to and new_assigned_to != old_assigned_to:
            await notify_users(
                self._db, [new_assigned_to],
                title="Lead assigned to you",
                message=f"'{updated.title}' has been assigned to you.",
            )
            await log_activity(
                self._db, user_id=actor_id, entity_type="lead", entity_id=lead_id,
                action="lead_assigned", description=f"Lead '{updated.title}' reassigned.",
            )

        new_status = data.get("status")
        if new_status and new_status != old_status:
            await notify_users(
                self._db, [updated.assigned_to],
                title="Lead status updated",
                message=f"'{updated.title}' status changed to {new_status}.",
            )
            await log_activity(
                self._db, user_id=actor_id, entity_type="lead", entity_id=lead_id,
                action="status_changed", description=f"Status changed from '{old_status}' to '{new_status}'.",
            )
        return updated
    async def delete_lead(self, lead_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_lead(lead_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(lead_id): raise NotFoundException("Lead")
    async def convert_lead(self, lead_id: uuid.UUID, client_id: uuid.UUID | None, actor_id: uuid.UUID | None = None) -> Lead:
        # Deferred imports: crm/tasks modules don't otherwise depend on leads, avoid a module-load cycle.
        from app.modules.crm.repository import ClientRepository
        from app.modules.tasks.repository import ProjectRepository

        lead = await self.get_lead(lead_id)
        if lead.status == "converted": raise BadRequestException("Lead is already converted.")

        if client_id is None:
            client = await ClientRepository(self._db).create_from_dict({
                "company_name": lead.company_name or lead.title,
                "email": lead.email,
                "phone": lead.phone,
                "assigned_to": lead.assigned_to,
                "created_by": actor_id,
            })
            client_id = client.id

        lead.status = "converted"
        lead.converted_client_id = client_id
        lead.converted_at = utc_now()
        await self._db.flush()
        await self._db.refresh(lead)

        project = await ProjectRepository(self._db).create_from_dict({
            "name": f"{lead.company_name or lead.title} - Onboarding",
            "client_id": client_id,
            "status": "active",
            "manager_id": lead.assigned_to,
        })

        await log_activity(
            self._db, user_id=actor_id, entity_type="lead", entity_id=lead_id,
            action="lead_converted",
            description=f"Lead '{lead.title}' converted to client; project '{project.name}' created.",
        )
        await notify_role(
            self._db, "admin",
            title="Lead converted - handoff ready",
            message=f"'{lead.title}' was converted by Sales. Project '{project.name}' created and awaiting handoff.",
        )
        if lead.assigned_to:
            await notify_users(
                self._db, [lead.assigned_to],
                title="Lead converted",
                message=f"'{lead.title}' was successfully converted to a client.",
            )
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
