"""Repository layer for Notifications."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from app.core.filters import apply_search, apply_sorting
from app.modules.notifications.models import Notification, NotificationTemplate
from app.repositories.base import BaseRepository

class NotificationTemplateRepository(BaseRepository[NotificationTemplate]):
    model = NotificationTemplate
    searchable_columns = [NotificationTemplate.name, NotificationTemplate.subject, NotificationTemplate.body]
    async def get_by_name(self, name: str) -> NotificationTemplate | None:
        r = await self._db.execute(select(NotificationTemplate).where(NotificationTemplate.name == name))
        return r.scalar_one_or_none()

class NotificationRepository(BaseRepository[Notification]):
    model = Notification
    searchable_columns = [Notification.title, Notification.message]
    async def get_all_filtered(self, *, search=None, user_id=None, is_read=None, channel=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Notification]:
        stmt = select(Notification)
        if user_id: stmt = stmt.where(Notification.user_id == user_id)
        if is_read is not None: stmt = stmt.where(Notification.is_read == is_read)
        if channel: stmt = stmt.where(Notification.channel == channel)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Notification, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, user_id=None, is_read=None, channel=None) -> int:
        stmt = select(func.count()).select_from(Notification)
        if user_id: stmt = stmt.where(Notification.user_id == user_id)
        if is_read is not None: stmt = stmt.where(Notification.is_read == is_read)
        if channel: stmt = stmt.where(Notification.channel == channel)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()
    async def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        stmt = select(Notification).where(Notification.user_id == user_id).where(Notification.is_read == False)
        items = (await self._db.execute(stmt)).scalars().all()
        for item in items:
            item.is_read = True
            item.read_at = func.now()
        return len(items)
