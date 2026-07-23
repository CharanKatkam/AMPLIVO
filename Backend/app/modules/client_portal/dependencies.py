"""DI factories for Client Portal."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.client_portal.repository import *
from app.modules.client_portal.service import *

def get_portal_setting_service(db: AsyncSession = Depends(get_db)) -> PortalSettingService:
    return PortalSettingService(PortalSettingRepository(db))

def get_portal_announcement_service(db: AsyncSession = Depends(get_db)) -> PortalAnnouncementService:
    return PortalAnnouncementService(PortalAnnouncementRepository(db))

def get_portal_resource_service(db: AsyncSession = Depends(get_db)) -> PortalResourceService:
    return PortalResourceService(PortalResourceRepository(db))
