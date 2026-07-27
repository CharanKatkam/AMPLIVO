"""DI factories for portal_access."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.portal_access.repository import PortalAccessTokenRepository
from app.modules.portal_access.service import PortalAccessTokenService


def get_portal_access_token_service(db: AsyncSession = Depends(get_db)) -> PortalAccessTokenService:
    return PortalAccessTokenService(PortalAccessTokenRepository(db))
