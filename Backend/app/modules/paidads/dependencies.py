"""DI factories for Paid Ads."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.paidads.repository import *
from app.modules.paidads.service import *

def get_ad_campaign_service(db: AsyncSession = Depends(get_db)) -> AdCampaignService:
    return AdCampaignService(AdCampaignRepository(db))

def get_ad_group_service(db: AsyncSession = Depends(get_db)) -> AdGroupService:
    return AdGroupService(AdGroupRepository(db))

def get_ad_metric_service(db: AsyncSession = Depends(get_db)) -> AdMetricService:
    return AdMetricService(AdMetricRepository(db))
