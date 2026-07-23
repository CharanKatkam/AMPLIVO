"""Repository layer for Settings."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from app.core.filters import apply_search
from app.modules.settings.models import SystemSetting, UserPreference
from app.repositories.base import BaseRepository

class SystemSettingRepository(BaseRepository[SystemSetting]):
    model = SystemSetting
    searchable_columns = [SystemSetting.key, SystemSetting.description]
    async def get_by_key(self, key: str) -> SystemSetting | None:
        r = await self._db.execute(select(SystemSetting).where(SystemSetting.key == key))
        return r.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, is_public=None, offset=0, limit=100) -> Sequence[SystemSetting]:
        stmt = select(SystemSetting)
        if is_public is not None: stmt = stmt.where(SystemSetting.is_public == is_public)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = stmt.order_by(SystemSetting.key).offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, is_public=None) -> int:
        stmt = select(func.count()).select_from(SystemSetting)
        if is_public is not None: stmt = stmt.where(SystemSetting.is_public == is_public)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class UserPreferenceRepository(BaseRepository[UserPreference]):
    model = UserPreference
    async def get_by_user(self, user_id: uuid.UUID) -> UserPreference | None:
        r = await self._db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
        return r.scalar_one_or_none()
