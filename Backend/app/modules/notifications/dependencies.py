"""DI factories for Notifications."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.notifications.repository import *
from app.modules.notifications.service import *

def get_notification_template_service(db: AsyncSession = Depends(get_db)) -> NotificationTemplateService:
    return NotificationTemplateService(NotificationTemplateRepository(db))

def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))
