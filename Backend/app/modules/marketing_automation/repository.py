"""Repository for the Marketing Automation module."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.modules.marketing_automation.models import AutomationWorkflow, AutomationAction, AutomationLog


class AutomationActionRepository(BaseRepository[AutomationAction]):
    model = AutomationAction

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class AutomationLogRepository(BaseRepository[AutomationLog]):
    model = AutomationLog

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)


class AutomationWorkflowRepository(BaseRepository[AutomationWorkflow]):
    model = AutomationWorkflow

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_detail(self, id: uuid.UUID) -> AutomationWorkflow | None:
        stmt = select(self.model).options(selectinload(self.model.actions)).where(self.model.id == id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
