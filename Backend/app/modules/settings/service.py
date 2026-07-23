"""Service layer for Settings."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.settings.models import SystemSetting, UserPreference
from app.modules.settings.repository import SystemSettingRepository, UserPreferenceRepository

class SystemSettingService:
    def __init__(self, repo: SystemSettingRepository) -> None:
        self._repo = repo
    async def list_settings(self, *, search=None, is_public=None, offset=0, limit=100):
        items = await self._repo.get_all_filtered(search=search, is_public=is_public, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, is_public=is_public)
        return items, total
    async def get_setting(self, setting_id: uuid.UUID) -> SystemSetting:
        s = await self._repo.get_by_id(setting_id)
        if s is None: raise NotFoundException("SystemSetting")
        return s
    async def get_by_key(self, key: str) -> SystemSetting:
        s = await self._repo.get_by_key(key)
        if s is None: raise NotFoundException("SystemSetting")
        return s
    async def create_setting(self, data: dict, updated_by: uuid.UUID | None = None) -> SystemSetting:
        data["updated_by"] = updated_by
        return await self._repo.create_from_dict(data)
    async def update_setting(self, setting_id: uuid.UUID, data: dict, updated_by: uuid.UUID | None = None) -> SystemSetting:
        data["updated_by"] = updated_by
        updated = await self._repo.update(setting_id, data)
        if updated is None: raise NotFoundException("SystemSetting")
        return updated
    async def delete_setting(self, setting_id: uuid.UUID) -> None:
        if not await self._repo.delete(setting_id): raise NotFoundException("SystemSetting")

class UserPreferenceService:
    def __init__(self, repo: UserPreferenceRepository) -> None:
        self._repo = repo
    async def get_preference(self, user_id: uuid.UUID) -> UserPreference:
        p = await self._repo.get_by_user(user_id)
        if p is None:
            # Create default preferences if none exist
            return await self._repo.create_from_dict({"user_id": user_id})
        return p
    async def update_preference(self, user_id: uuid.UUID, data: dict) -> UserPreference:
        p = await self.get_preference(user_id)
        updated = await self._repo.update(p.id, data)
        if updated is None: raise NotFoundException("UserPreference")
        return updated
