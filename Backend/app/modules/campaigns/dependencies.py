"""DI factories for the Campaigns module."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.campaigns.repository import *
from app.modules.campaigns.service import *

def get_campaign_service(db: AsyncSession = Depends(get_db)) -> CampaignService:
    return CampaignService(CampaignRepository(db))

def get_campaign_platform_service(db: AsyncSession = Depends(get_db)) -> CampaignPlatformService:
    return CampaignPlatformService(CampaignPlatformRepository(db))

def get_campaign_asset_service(db: AsyncSession = Depends(get_db)) -> CampaignAssetService:
    return CampaignAssetService(CampaignAssetRepository(db))

def get_campaign_metric_service(db: AsyncSession = Depends(get_db)) -> CampaignMetricService:
    return CampaignMetricService(CampaignMetricRepository(db))
