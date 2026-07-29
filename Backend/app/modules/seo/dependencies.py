"""DI factories for SEO."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.seo.repository import *
from app.modules.seo.service import *

def get_seo_project_service(db: AsyncSession = Depends(get_db)) -> SeoProjectService:
    return SeoProjectService(SeoProjectRepository(db))

def get_seo_keyword_service(db: AsyncSession = Depends(get_db)) -> SeoKeywordService:
    return SeoKeywordService(SeoKeywordRepository(db))

def get_seo_audit_service(db: AsyncSession = Depends(get_db)) -> SeoAuditService:
    return SeoAuditService(SeoAuditRepository(db))

def get_seo_backlink_service(db: AsyncSession = Depends(get_db)) -> SeoBacklinkService:
    return SeoBacklinkService(SeoBacklinkRepository(db))
