"""DI factories for Social."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.social.repository import *
from app.modules.social.service import *

def get_social_profile_service(db: AsyncSession = Depends(get_db)) -> SocialProfileService:
    return SocialProfileService(SocialProfileRepository(db))

def get_social_post_service(db: AsyncSession = Depends(get_db)) -> SocialPostService:
    return SocialPostService(SocialPostRepository(db))

def get_social_metric_service(db: AsyncSession = Depends(get_db)) -> SocialMetricService:
    return SocialMetricService(SocialMetricRepository(db))
