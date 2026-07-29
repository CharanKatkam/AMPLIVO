"""Service layer for Social."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.social.models import SocialMetric, SocialPost, SocialProfile
from app.modules.social.repository import SocialMetricRepository, SocialPostRepository, SocialProfileRepository

class SocialProfileService:
    def __init__(self, repo: SocialProfileRepository) -> None:
        self._repo = repo
    async def list_profiles(self, *, search=None, client_id=None, platform=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, platform=platform, status=status, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, platform=platform, status=status)
        return items, total
    async def get_profile(self, profile_id: uuid.UUID) -> SocialProfile:
        p = await self._repo.get_detail(profile_id)
        if p is None: raise NotFoundException("SocialProfile")
        return p
    async def create_profile(self, data: dict) -> SocialProfile:
        return await self._repo.create_from_dict(data)
    async def update_profile(self, profile_id: uuid.UUID, data: dict) -> SocialProfile:
        updated = await self._repo.update(profile_id, data)
        if updated is None: raise NotFoundException("SocialProfile")
        return updated
    async def delete_profile(self, profile_id: uuid.UUID) -> None:
        if not await self._repo.delete(profile_id): raise NotFoundException("SocialProfile")

class SocialPostService:
    def __init__(self, repo: SocialPostRepository) -> None:
        self._repo = repo
    async def list_posts(self, profile_id: uuid.UUID) -> Sequence[SocialPost]:
        return await self._repo.list_by_profile(profile_id)
    async def get_post(self, post_id: uuid.UUID) -> SocialPost:
        p = await self._repo.get_detail(post_id)
        if p is None: raise NotFoundException("SocialPost")
        return p
    async def create_post(self, profile_id: uuid.UUID, data: dict, author_id: uuid.UUID | None = None) -> SocialPost:
        data["profile_id"] = profile_id; data["author_id"] = author_id
        return await self._repo.create_from_dict(data)
    async def update_post(self, post_id: uuid.UUID, data: dict) -> SocialPost:
        updated = await self._repo.update(post_id, data)
        if updated is None: raise NotFoundException("SocialPost")
        return updated
    async def delete_post(self, post_id: uuid.UUID) -> None:
        if not await self._repo.delete(post_id): raise NotFoundException("SocialPost")

class SocialMetricService:
    def __init__(self, repo: SocialMetricRepository) -> None:
        self._repo = repo
    async def list_metrics(self, post_id: uuid.UUID) -> Sequence[SocialMetric]:
        return await self._repo.list_by_post(post_id)
    async def create_metric(self, post_id: uuid.UUID, data: dict) -> SocialMetric:
        data["post_id"] = post_id
        return await self._repo.create_from_dict(data)
    async def update_metric(self, metric_id: uuid.UUID, data: dict) -> SocialMetric:
        updated = await self._repo.update(metric_id, data)
        if updated is None: raise NotFoundException("SocialMetric")
        return updated
    async def delete_metric(self, metric_id: uuid.UUID) -> None:
        if not await self._repo.delete(metric_id): raise NotFoundException("SocialMetric")
