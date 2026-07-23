"""Repository layer for Influencers."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.influencers.models import Influencer, InfluencerCampaign, InfluencerContract
from app.repositories.base import BaseRepository

class InfluencerRepository(BaseRepository[Influencer]):
    model = Influencer
    searchable_columns = [Influencer.name, Influencer.niche, Influencer.platform]
    async def get_detail(self, influencer_id: uuid.UUID) -> Influencer | None:
        stmt = select(Influencer).options(selectinload(Influencer.campaigns), selectinload(Influencer.contracts)).where(Influencer.id == influencer_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, platform=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Influencer]:
        stmt = select(Influencer)
        if platform: stmt = stmt.where(Influencer.platform == platform)
        if status: stmt = stmt.where(Influencer.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Influencer, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, platform=None, status=None) -> int:
        stmt = select(func.count()).select_from(Influencer)
        if platform: stmt = stmt.where(Influencer.platform == platform)
        if status: stmt = stmt.where(Influencer.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class InfluencerCampaignRepository(BaseRepository[InfluencerCampaign]):
    model = InfluencerCampaign
    async def list_by_influencer(self, influencer_id: uuid.UUID) -> Sequence[InfluencerCampaign]:
        r = await self._db.execute(select(InfluencerCampaign).where(InfluencerCampaign.influencer_id == influencer_id).order_by(InfluencerCampaign.created_at.desc()))
        return r.scalars().all()

class InfluencerContractRepository(BaseRepository[InfluencerContract]):
    model = InfluencerContract
    async def list_by_influencer(self, influencer_id: uuid.UUID) -> Sequence[InfluencerContract]:
        r = await self._db.execute(select(InfluencerContract).where(InfluencerContract.influencer_id == influencer_id).order_by(InfluencerContract.created_at.desc()))
        return r.scalars().all()
