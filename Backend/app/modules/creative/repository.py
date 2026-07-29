"""Repository layer for Creative."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.creative.models import CreativeAsset, CreativeFeedback, CreativeProject
from app.repositories.base import BaseRepository

class CreativeProjectRepository(BaseRepository[CreativeProject]):
    model = CreativeProject
    searchable_columns = [CreativeProject.name, CreativeProject.description]
    async def get_detail(self, project_id: uuid.UUID) -> CreativeProject | None:
        stmt = select(CreativeProject).options(selectinload(CreativeProject.assets)).where(CreativeProject.id == project_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, campaign_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[CreativeProject]:
        stmt = select(CreativeProject)
        if client_id: stmt = stmt.where(CreativeProject.client_id == client_id)
        if campaign_id: stmt = stmt.where(CreativeProject.campaign_id == campaign_id)
        if status: stmt = stmt.where(CreativeProject.status == status)
        if manager_id: stmt = stmt.where(CreativeProject.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=CreativeProject, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, campaign_id=None, status=None, manager_id=None) -> int:
        stmt = select(func.count()).select_from(CreativeProject)
        if client_id: stmt = stmt.where(CreativeProject.client_id == client_id)
        if campaign_id: stmt = stmt.where(CreativeProject.campaign_id == campaign_id)
        if status: stmt = stmt.where(CreativeProject.status == status)
        if manager_id: stmt = stmt.where(CreativeProject.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class CreativeAssetRepository(BaseRepository[CreativeAsset]):
    model = CreativeAsset
    searchable_columns = [CreativeAsset.name, CreativeAsset.asset_type, CreativeAsset.version]
    async def list_by_project(self, project_id: uuid.UUID) -> Sequence[CreativeAsset]:
        r = await self._db.execute(select(CreativeAsset).where(CreativeAsset.project_id == project_id).order_by(CreativeAsset.created_at.desc()))
        return r.scalars().all()
    async def get_detail(self, asset_id: uuid.UUID) -> CreativeAsset | None:
        stmt = select(CreativeAsset).options(selectinload(CreativeAsset.feedbacks)).where(CreativeAsset.id == asset_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

class CreativeFeedbackRepository(BaseRepository[CreativeFeedback]):
    model = CreativeFeedback
    async def list_by_asset(self, asset_id: uuid.UUID) -> Sequence[CreativeFeedback]:
        r = await self._db.execute(select(CreativeFeedback).where(CreativeFeedback.asset_id == asset_id).order_by(CreativeFeedback.created_at))
        return r.scalars().all()
