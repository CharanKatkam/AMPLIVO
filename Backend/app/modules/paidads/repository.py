"""Repository layer for Paid Ads."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.paidads.models import AdCampaign, AdGroup, AdMetric
from app.repositories.base import BaseRepository

class AdCampaignRepository(BaseRepository[AdCampaign]):
    model = AdCampaign
    searchable_columns = [AdCampaign.name, AdCampaign.platform]
    async def get_detail(self, campaign_id: uuid.UUID) -> AdCampaign | None:
        stmt = select(AdCampaign).options(selectinload(AdCampaign.ad_groups), selectinload(AdCampaign.metrics)).where(AdCampaign.id == campaign_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, platform=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[AdCampaign]:
        stmt = select(AdCampaign)
        if client_id: stmt = stmt.where(AdCampaign.client_id == client_id)
        if platform: stmt = stmt.where(AdCampaign.platform == platform)
        if status: stmt = stmt.where(AdCampaign.status == status)
        if manager_id: stmt = stmt.where(AdCampaign.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=AdCampaign, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, platform=None, status=None, manager_id=None) -> int:
        stmt = select(func.count()).select_from(AdCampaign)
        if client_id: stmt = stmt.where(AdCampaign.client_id == client_id)
        if platform: stmt = stmt.where(AdCampaign.platform == platform)
        if status: stmt = stmt.where(AdCampaign.status == status)
        if manager_id: stmt = stmt.where(AdCampaign.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class AdGroupRepository(BaseRepository[AdGroup]):
    model = AdGroup
    searchable_columns = [AdGroup.name, AdGroup.target_audience]
    async def list_by_campaign(self, campaign_id: uuid.UUID) -> Sequence[AdGroup]:
        r = await self._db.execute(select(AdGroup).where(AdGroup.campaign_id == campaign_id).order_by(AdGroup.name))
        return r.scalars().all()

class AdMetricRepository(BaseRepository[AdMetric]):
    model = AdMetric
    async def list_by_campaign(self, campaign_id: uuid.UUID) -> Sequence[AdMetric]:
        r = await self._db.execute(select(AdMetric).where(AdMetric.campaign_id == campaign_id).order_by(AdMetric.date.desc()))
        return r.scalars().all()
