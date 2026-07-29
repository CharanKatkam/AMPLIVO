"""Service layer for Notifications."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func
from app.core.exceptions import ForbiddenException, NotFoundException
from app.modules.notifications.models import Notification, NotificationTemplate
from app.modules.notifications.repository import NotificationRepository, NotificationTemplateRepository

class NotificationTemplateService:
    def __init__(self, repo: NotificationTemplateRepository) -> None:
        self._repo = repo
    async def list_templates(self, *, offset=0, limit=100) -> Sequence[NotificationTemplate]:
        return await self._repo.get_all(offset=offset, limit=limit)
    async def get_template(self, template_id: uuid.UUID) -> NotificationTemplate:
        t = await self._repo.get_by_id(template_id)
        if t is None: raise NotFoundException("NotificationTemplate")
        return t
    async def create_template(self, data: dict) -> NotificationTemplate:
        return await self._repo.create_from_dict(data)
    async def update_template(self, template_id: uuid.UUID, data: dict) -> NotificationTemplate:
        updated = await self._repo.update(template_id, data)
        if updated is None: raise NotFoundException("NotificationTemplate")
        return updated
    async def delete_template(self, template_id: uuid.UUID) -> None:
        if not await self._repo.delete(template_id): raise NotFoundException("NotificationTemplate")

class NotificationService:
    def __init__(self, repo: NotificationRepository) -> None:
        self._repo = repo
    async def list_notifications(self, *, search=None, user_id=None, is_read=None, channel=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, user_id=user_id, is_read=is_read, channel=channel, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, user_id=user_id, is_read=is_read, channel=channel)
        return items, total
    async def get_notification(self, notification_id: uuid.UUID, *, current_user_id: uuid.UUID | None = None) -> Notification:
        n = await self._repo.get_by_id(notification_id)
        if n is None: raise NotFoundException("Notification")
        if current_user_id is not None and n.user_id != current_user_id:
            raise ForbiddenException("You do not have access to this notification.")
        return n
    async def create_notification(self, data: dict) -> Notification:
        return await self._repo.create_from_dict(data)
    async def mark_as_read(self, notification_id: uuid.UUID, *, current_user_id: uuid.UUID | None = None) -> Notification:
        await self.get_notification(notification_id, current_user_id=current_user_id)
        updated = await self._repo.update(notification_id, {"is_read": True, "read_at": func.now()})
        if updated is None: raise NotFoundException("Notification")
        return updated
    async def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        return await self._repo.mark_all_as_read(user_id)
    async def delete_notification(self, notification_id: uuid.UUID, *, current_user_id: uuid.UUID | None = None) -> None:
        await self.get_notification(notification_id, current_user_id=current_user_id)
        if not await self._repo.delete(notification_id): raise NotFoundException("Notification")
