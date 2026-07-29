"""DI factories for Influencers."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.influencers.repository import *
from app.modules.influencers.service import *

def get_influencer_service(db: AsyncSession = Depends(get_db)) -> InfluencerService:
    return InfluencerService(InfluencerRepository(db))

def get_influencer_campaign_service(db: AsyncSession = Depends(get_db)) -> InfluencerCampaignService:
    return InfluencerCampaignService(InfluencerCampaignRepository(db))

def get_influencer_contract_service(db: AsyncSession = Depends(get_db)) -> InfluencerContractService:
    return InfluencerContractService(InfluencerContractRepository(db))
