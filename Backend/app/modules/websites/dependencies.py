"""DI factories for Websites."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.websites.repository import *
from app.modules.websites.service import *

def get_website_service(db: AsyncSession = Depends(get_db)) -> WebsiteService:
    return WebsiteService(WebsiteRepository(db))

def get_website_page_service(db: AsyncSession = Depends(get_db)) -> WebsitePageService:
    return WebsitePageService(WebsitePageRepository(db))

def get_website_metric_service(db: AsyncSession = Depends(get_db)) -> WebsiteMetricService:
    return WebsiteMetricService(WebsiteMetricRepository(db))
