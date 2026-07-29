"""Event-triggered notifications + activity-log writes for the Sales Dashboard.

There is no background scheduler (Celery/cron) anywhere in this codebase, so
these are called synchronously, inline, from the service methods where the
triggering event actually happens (lead created/assigned, meeting scheduled,
invoice sent, etc.) rather than on a time-based reminder loop.
"""
from __future__ import annotations

import json
import uuid
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.modules.activity_timeline.repository import ActivityLogRepository
from app.modules.notifications.repository import NotificationRepository
from app.modules.users.models import Role


async def notify_users(
    db: AsyncSession,
    user_ids: Iterable[uuid.UUID | None],
    *,
    title: str,
    message: str,
    channel: str = "in_app",
) -> None:
    repo = NotificationRepository(db)
    seen: set[uuid.UUID] = set()
    for user_id in user_ids:
        if user_id is None or user_id in seen:
            continue
        seen.add(user_id)
        await repo.create_from_dict(
            {"user_id": user_id, "channel": channel, "title": title, "message": message, "status": "sent"}
        )


async def notify_role(db: AsyncSession, role_slug: str, *, title: str, message: str, channel: str = "in_app") -> None:
    result = await db.execute(
        select(User.id).join(Role, User.role_id == Role.id).where(Role.slug == role_slug, User.is_active.is_(True))
    )
    await notify_users(db, result.scalars().all(), title=title, message=message, channel=channel)


async def log_activity(
    db: AsyncSession,
    *,
    user_id: uuid.UUID | None,
    entity_type: str,
    entity_id: uuid.UUID | None,
    action: str,
    description: str | None = None,
    extra_data: dict | None = None,
) -> None:
    repo = ActivityLogRepository(db)
    await repo.create_from_dict(
        {
            "user_id": user_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "description": description,
            "extra_data": json.dumps(extra_data) if extra_data else None,
        }
    )
