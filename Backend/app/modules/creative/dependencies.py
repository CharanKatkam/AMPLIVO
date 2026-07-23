"""DI factories for Creative."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.creative.repository import *
from app.modules.creative.service import *

def get_creative_project_service(db: AsyncSession = Depends(get_db)) -> CreativeProjectService:
    return CreativeProjectService(CreativeProjectRepository(db))

def get_creative_asset_service(db: AsyncSession = Depends(get_db)) -> CreativeAssetService:
    return CreativeAssetService(CreativeAssetRepository(db))

def get_creative_feedback_service(db: AsyncSession = Depends(get_db)) -> CreativeFeedbackService:
    return CreativeFeedbackService(CreativeFeedbackRepository(db))
