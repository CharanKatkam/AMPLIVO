"""DI factories for Settings."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.settings.repository import *
from app.modules.settings.service import *

def get_system_setting_service(db: AsyncSession = Depends(get_db)) -> SystemSettingService:
    return SystemSettingService(SystemSettingRepository(db))

def get_user_preference_service(db: AsyncSession = Depends(get_db)) -> UserPreferenceService:
    return UserPreferenceService(UserPreferenceRepository(db))
