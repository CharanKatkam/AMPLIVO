"""Repository layer for Client Portal."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from app.core.filters import apply_search, apply_sorting
from app.modules.client_portal.models import PortalAnnouncement, PortalResource, PortalSetting
from app.repositories.base import BaseRepository

class PortalSettingRepository(BaseRepository[PortalSetting]):
    model = PortalSetting
    async def get_by_client(self, client_id: uuid.UUID) -> PortalSetting | None:
        r = await self._db.execute(select(PortalSetting).where(PortalSetting.client_id == client_id))
        return r.scalar_one_or_none()

class PortalAnnouncementRepository(BaseRepository[PortalAnnouncement]):
    model = PortalAnnouncement
    searchable_columns = [PortalAnnouncement.title, PortalAnnouncement.content]
    async def get_all_filtered(self, *, search=None, client_id=None, is_active=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[PortalAnnouncement]:
        stmt = select(PortalAnnouncement)
        if client_id: stmt = stmt.where((PortalAnnouncement.client_id == client_id) | (PortalAnnouncement.client_id == None))
        if is_active is not None: stmt = stmt.where(PortalAnnouncement.is_active == is_active)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=PortalAnnouncement, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, is_active=None) -> int:
        stmt = select(func.count()).select_from(PortalAnnouncement)
        if client_id: stmt = stmt.where((PortalAnnouncement.client_id == client_id) | (PortalAnnouncement.client_id == None))
        if is_active is not None: stmt = stmt.where(PortalAnnouncement.is_active == is_active)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class PortalResourceRepository(BaseRepository[PortalResource]):
    model = PortalResource
    searchable_columns = [PortalResource.title, PortalResource.description]
    async def get_all_filtered(self, *, search=None, client_id=None, resource_type=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[PortalResource]:
        stmt = select(PortalResource)
        if client_id: stmt = stmt.where(PortalResource.client_id == client_id)
        if resource_type: stmt = stmt.where(PortalResource.resource_type == resource_type)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=PortalResource, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, resource_type=None) -> int:
        stmt = select(func.count()).select_from(PortalResource)
        if client_id: stmt = stmt.where(PortalResource.client_id == client_id)
        if resource_type: stmt = stmt.where(PortalResource.resource_type == resource_type)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()
