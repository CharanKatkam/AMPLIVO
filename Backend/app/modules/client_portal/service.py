"""Service layer for Client Portal."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.client_portal.models import PortalAnnouncement, PortalResource, PortalSetting
from app.modules.client_portal.repository import PortalAnnouncementRepository, PortalResourceRepository, PortalSettingRepository

class PortalSettingService:
    def __init__(self, repo: PortalSettingRepository) -> None:
        self._repo = repo
    async def get_setting(self, client_id: uuid.UUID) -> PortalSetting:
        s = await self._repo.get_by_client(client_id)
        if s is None: raise NotFoundException("PortalSetting")
        return s
    async def upsert_setting(self, client_id: uuid.UUID, data: dict) -> PortalSetting:
        s = await self._repo.get_by_client(client_id)
        if s:
            updated = await self._repo.update(s.id, data)
            if updated is None: raise NotFoundException("PortalSetting")
            return updated
        else:
            data["client_id"] = client_id
            return await self._repo.create_from_dict(data)

class PortalAnnouncementService:
    def __init__(self, repo: PortalAnnouncementRepository) -> None:
        self._repo = repo
    async def list_announcements(self, *, search=None, client_id=None, is_active=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, is_active=is_active, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, is_active=is_active)
        return items, total
    async def get_announcement(self, announcement_id: uuid.UUID) -> PortalAnnouncement:
        a = await self._repo.get_by_id(announcement_id)
        if a is None: raise NotFoundException("PortalAnnouncement")
        return a
    async def create_announcement(self, data: dict, author_id: uuid.UUID | None = None) -> PortalAnnouncement:
        data["author_id"] = author_id
        return await self._repo.create_from_dict(data)
    async def update_announcement(self, announcement_id: uuid.UUID, data: dict) -> PortalAnnouncement:
        updated = await self._repo.update(announcement_id, data)
        if updated is None: raise NotFoundException("PortalAnnouncement")
        return updated
    async def delete_announcement(self, announcement_id: uuid.UUID) -> None:
        if not await self._repo.delete(announcement_id): raise NotFoundException("PortalAnnouncement")

class PortalResourceService:
    def __init__(self, repo: PortalResourceRepository) -> None:
        self._repo = repo
    async def list_resources(self, *, search=None, client_id=None, resource_type=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, resource_type=resource_type, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, resource_type=resource_type)
        return items, total
    async def get_resource(self, resource_id: uuid.UUID) -> PortalResource:
        r = await self._repo.get_by_id(resource_id)
        if r is None: raise NotFoundException("PortalResource")
        return r
    async def create_resource(self, data: dict, uploaded_by: uuid.UUID | None = None) -> PortalResource:
        data["uploaded_by"] = uploaded_by
        return await self._repo.create_from_dict(data)
    async def update_resource(self, resource_id: uuid.UUID, data: dict) -> PortalResource:
        updated = await self._repo.update(resource_id, data)
        if updated is None: raise NotFoundException("PortalResource")
        return updated
    async def delete_resource(self, resource_id: uuid.UUID) -> None:
        if not await self._repo.delete(resource_id): raise NotFoundException("PortalResource")
