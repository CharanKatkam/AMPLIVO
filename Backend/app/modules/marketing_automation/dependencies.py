"""Dependencies for the Marketing Automation module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.marketing_automation.service import AutomationWorkflowService


def get_automation_service(db: AsyncSession = Depends(get_db)) -> AutomationWorkflowService:
    return AutomationWorkflowService(db)
