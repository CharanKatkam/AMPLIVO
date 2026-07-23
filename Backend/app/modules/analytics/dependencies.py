"""DI factories for Analytics."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.analytics.repository import *
from app.modules.analytics.service import *

def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(DashboardRepository(db))

def get_report_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(ReportRepository(db))

def get_data_integration_service(db: AsyncSession = Depends(get_db)) -> DataIntegrationService:
    return DataIntegrationService(DataIntegrationRepository(db))
