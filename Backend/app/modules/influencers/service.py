"""Service layer for Influencers."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.influencers.models import Influencer, InfluencerCampaign, InfluencerContract
from app.modules.influencers.repository import InfluencerCampaignRepository, InfluencerContractRepository, InfluencerRepository

class InfluencerService:
    def __init__(self, repo: InfluencerRepository) -> None:
        self._repo = repo
    async def list_influencers(self, *, search=None, platform=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, platform=platform, status=status, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, platform=platform, status=status)
        return items, total
    async def get_influencer(self, influencer_id: uuid.UUID) -> Influencer:
        i = await self._repo.get_detail(influencer_id)
        if i is None: raise NotFoundException("Influencer")
        return i
    async def create_influencer(self, data: dict) -> Influencer:
        return await self._repo.create_from_dict(data)
    async def update_influencer(self, influencer_id: uuid.UUID, data: dict) -> Influencer:
        updated = await self._repo.update(influencer_id, data)
        if updated is None: raise NotFoundException("Influencer")
        return updated
    async def delete_influencer(self, influencer_id: uuid.UUID) -> None:
        if not await self._repo.delete(influencer_id): raise NotFoundException("Influencer")

class InfluencerCampaignService:
    def __init__(self, repo: InfluencerCampaignRepository) -> None:
        self._repo = repo
    async def list_campaigns(self, influencer_id: uuid.UUID) -> Sequence[InfluencerCampaign]:
        return await self._repo.list_by_influencer(influencer_id)
    async def create_campaign(self, influencer_id: uuid.UUID, data: dict) -> InfluencerCampaign:
        data["influencer_id"] = influencer_id
        return await self._repo.create_from_dict(data)
    async def update_campaign(self, campaign_id: uuid.UUID, data: dict) -> InfluencerCampaign:
        updated = await self._repo.update(campaign_id, data)
        if updated is None: raise NotFoundException("InfluencerCampaign")
        return updated
    async def delete_campaign(self, campaign_id: uuid.UUID) -> None:
        if not await self._repo.delete(campaign_id): raise NotFoundException("InfluencerCampaign")

class InfluencerContractService:
    def __init__(self, repo: InfluencerContractRepository) -> None:
        self._repo = repo
    async def list_contracts(self, influencer_id: uuid.UUID) -> Sequence[InfluencerContract]:
        return await self._repo.list_by_influencer(influencer_id)
    async def create_contract(self, influencer_id: uuid.UUID, data: dict) -> InfluencerContract:
        data["influencer_id"] = influencer_id
        return await self._repo.create_from_dict(data)
    async def update_contract(self, contract_id: uuid.UUID, data: dict) -> InfluencerContract:
        updated = await self._repo.update(contract_id, data)
        if updated is None: raise NotFoundException("InfluencerContract")
        return updated
    async def delete_contract(self, contract_id: uuid.UUID) -> None:
        if not await self._repo.delete(contract_id): raise NotFoundException("InfluencerContract")
