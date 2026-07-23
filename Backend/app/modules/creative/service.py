"""Service layer for Creative."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.creative.models import CreativeAsset, CreativeFeedback, CreativeProject
from app.modules.creative.repository import CreativeAssetRepository, CreativeFeedbackRepository, CreativeProjectRepository

class CreativeProjectService:
    def __init__(self, repo: CreativeProjectRepository) -> None:
        self._repo = repo
    async def list_projects(self, *, search=None, client_id=None, campaign_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, campaign_id=campaign_id, status=status, manager_id=manager_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, campaign_id=campaign_id, status=status, manager_id=manager_id)
        return items, total
    async def get_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> CreativeProject:
        p = await self._repo.get_detail(project_id)
        if p is None: raise NotFoundException("CreativeProject")
        enforce_client_scope(p.client_id, scoped_client_id)
        return p
    async def create_project(self, data: dict) -> CreativeProject:
        return await self._repo.create_from_dict(data)
    async def update_project(self, project_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> CreativeProject:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(project_id, data)
        if updated is None: raise NotFoundException("CreativeProject")
        return updated
    async def delete_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(project_id): raise NotFoundException("CreativeProject")

class CreativeAssetService:
    def __init__(self, repo: CreativeAssetRepository) -> None:
        self._repo = repo
    async def list_assets(self, project_id: uuid.UUID) -> Sequence[CreativeAsset]:
        return await self._repo.list_by_project(project_id)
    async def get_asset(self, asset_id: uuid.UUID) -> CreativeAsset:
        a = await self._repo.get_detail(asset_id)
        if a is None: raise NotFoundException("CreativeAsset")
        return a
    async def create_asset(self, project_id: uuid.UUID, data: dict, designer_id: uuid.UUID | None = None) -> CreativeAsset:
        data["project_id"] = project_id; data["designer_id"] = designer_id
        return await self._repo.create_from_dict(data)
    async def update_asset(self, asset_id: uuid.UUID, data: dict) -> CreativeAsset:
        updated = await self._repo.update(asset_id, data)
        if updated is None: raise NotFoundException("CreativeAsset")
        return updated
    async def delete_asset(self, asset_id: uuid.UUID) -> None:
        if not await self._repo.delete(asset_id): raise NotFoundException("CreativeAsset")

class CreativeFeedbackService:
    def __init__(self, repo: CreativeFeedbackRepository) -> None:
        self._repo = repo
    async def list_feedback(self, asset_id: uuid.UUID) -> Sequence[CreativeFeedback]:
        return await self._repo.list_by_asset(asset_id)
    async def create_feedback(self, asset_id: uuid.UUID, data: dict, user_id: uuid.UUID | None = None) -> CreativeFeedback:
        data["asset_id"] = asset_id; data["user_id"] = user_id
        return await self._repo.create_from_dict(data)
    async def update_feedback(self, feedback_id: uuid.UUID, data: dict) -> CreativeFeedback:
        updated = await self._repo.update(feedback_id, data)
        if updated is None: raise NotFoundException("CreativeFeedback")
        return updated
    async def delete_feedback(self, feedback_id: uuid.UUID) -> None:
        if not await self._repo.delete(feedback_id): raise NotFoundException("CreativeFeedback")
