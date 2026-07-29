"""DI factories for the Lead Management module."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.leads.repository import (
    LeadActivityRepository, LeadFollowupRepository, LeadRepository,
    LeadSourceRepository, SalesPipelineRepository,
)
from app.modules.leads.service import (
    LeadActivityService, LeadFollowupService, LeadService,
    LeadSourceService, SalesPipelineService,
)

def get_lead_source_service(db: AsyncSession = Depends(get_db)) -> LeadSourceService:
    return LeadSourceService(LeadSourceRepository(db))

def get_lead_service(db: AsyncSession = Depends(get_db)) -> LeadService:
    return LeadService(db, LeadRepository(db), LeadActivityRepository(db))

def get_lead_activity_service(db: AsyncSession = Depends(get_db)) -> LeadActivityService:
    return LeadActivityService(db, LeadActivityRepository(db))

def get_lead_followup_service(db: AsyncSession = Depends(get_db)) -> LeadFollowupService:
    return LeadFollowupService(db, LeadFollowupRepository(db))

def get_sales_pipeline_service(db: AsyncSession = Depends(get_db)) -> SalesPipelineService:
    return SalesPipelineService(SalesPipelineRepository(db))
