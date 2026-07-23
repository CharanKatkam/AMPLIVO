"""Service layer for Paid Ads."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.paidads.models import AdCampaign, AdGroup, AdMetric
from app.modules.paidads.repository import AdCampaignRepository, AdGroupRepository, AdMetricRepository

class AdCampaignService:
    def __init__(self, repo: AdCampaignRepository) -> None:
        self._repo = repo
    async def list_campaigns(self, *, search=None, client_id=None, platform=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, platform=platform, status=status, manager_id=manager_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, platform=platform, status=status, manager_id=manager_id)
        return items, total
    async def get_campaign(self, campaign_id: uuid.UUID) -> AdCampaign:
        c = await self._repo.get_detail(campaign_id)
        if c is None: raise NotFoundException("AdCampaign")
        return c
    async def create_campaign(self, data: dict) -> AdCampaign:
        return await self._repo.create_from_dict(data)
    async def update_campaign(self, campaign_id: uuid.UUID, data: dict) -> AdCampaign:
        updated = await self._repo.update(campaign_id, data)
        if updated is None: raise NotFoundException("AdCampaign")
        return updated
    async def delete_campaign(self, campaign_id: uuid.UUID) -> None:
        if not await self._repo.delete(campaign_id): raise NotFoundException("AdCampaign")

class AdGroupService:
    def __init__(self, repo: AdGroupRepository) -> None:
        self._repo = repo
    async def list_groups(self, campaign_id: uuid.UUID) -> Sequence[AdGroup]:
        return await self._repo.list_by_campaign(campaign_id)
    async def create_group(self, campaign_id: uuid.UUID, data: dict) -> AdGroup:
        data["campaign_id"] = campaign_id
        return await self._repo.create_from_dict(data)
    async def update_group(self, group_id: uuid.UUID, data: dict) -> AdGroup:
        updated = await self._repo.update(group_id, data)
        if updated is None: raise NotFoundException("AdGroup")
        return updated
    async def delete_group(self, group_id: uuid.UUID) -> None:
        if not await self._repo.delete(group_id): raise NotFoundException("AdGroup")

class AdMetricService:
    def __init__(self, repo: AdMetricRepository) -> None:
        self._repo = repo
    async def list_metrics(self, campaign_id: uuid.UUID) -> Sequence[AdMetric]:
        return await self._repo.list_by_campaign(campaign_id)
    async def create_metric(self, campaign_id: uuid.UUID, data: dict) -> AdMetric:
        data["campaign_id"] = campaign_id
        return await self._repo.create_from_dict(data)
    async def update_metric(self, metric_id: uuid.UUID, data: dict) -> AdMetric:
        updated = await self._repo.update(metric_id, data)
        if updated is None: raise NotFoundException("AdMetric")
        return updated
    async def delete_metric(self, metric_id: uuid.UUID) -> None:
        if not await self._repo.delete(metric_id): raise NotFoundException("AdMetric")
