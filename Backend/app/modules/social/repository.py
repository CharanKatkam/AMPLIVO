"""Repository layer for Social."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.social.models import SocialMetric, SocialPost, SocialProfile
from app.repositories.base import BaseRepository

class SocialProfileRepository(BaseRepository[SocialProfile]):
    model = SocialProfile
    searchable_columns = [SocialProfile.profile_name, SocialProfile.platform]
    async def get_detail(self, profile_id: uuid.UUID) -> SocialProfile | None:
        stmt = select(SocialProfile).options(selectinload(SocialProfile.posts)).where(SocialProfile.id == profile_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, platform=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[SocialProfile]:
        stmt = select(SocialProfile)
        if client_id: stmt = stmt.where(SocialProfile.client_id == client_id)
        if platform: stmt = stmt.where(SocialProfile.platform == platform)
        if status: stmt = stmt.where(SocialProfile.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=SocialProfile, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, platform=None, status=None) -> int:
        stmt = select(func.count()).select_from(SocialProfile)
        if client_id: stmt = stmt.where(SocialProfile.client_id == client_id)
        if platform: stmt = stmt.where(SocialProfile.platform == platform)
        if status: stmt = stmt.where(SocialProfile.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class SocialPostRepository(BaseRepository[SocialPost]):
    model = SocialPost
    searchable_columns = [SocialPost.content]
    async def list_by_profile(self, profile_id: uuid.UUID) -> Sequence[SocialPost]:
        r = await self._db.execute(select(SocialPost).where(SocialPost.profile_id == profile_id).order_by(SocialPost.scheduled_at.desc()))
        return r.scalars().all()
    async def get_detail(self, post_id: uuid.UUID) -> SocialPost | None:
        stmt = select(SocialPost).options(selectinload(SocialPost.metrics)).where(SocialPost.id == post_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

class SocialMetricRepository(BaseRepository[SocialMetric]):
    model = SocialMetric
    async def list_by_post(self, post_id: uuid.UUID) -> Sequence[SocialMetric]:
        r = await self._db.execute(select(SocialMetric).where(SocialMetric.post_id == post_id).order_by(SocialMetric.date.desc()))
        return r.scalars().all()
