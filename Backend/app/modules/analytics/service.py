"""Service layer for Analytics."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.analytics.models import Dashboard, DataIntegration, Report
from app.modules.analytics.repository import DashboardRepository, DataIntegrationRepository, ReportRepository

class DashboardService:
    def __init__(self, repo: DashboardRepository) -> None:
        self._repo = repo
    async def list_dashboards(self, *, search=None, is_shared=None, owner_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, is_shared=is_shared, owner_id=owner_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, is_shared=is_shared, owner_id=owner_id)
        return items, total
    async def get_dashboard(self, dashboard_id: uuid.UUID) -> Dashboard:
        d = await self._repo.get_by_id(dashboard_id)
        if d is None: raise NotFoundException("Dashboard")
        return d
    async def create_dashboard(self, data: dict, owner_id: uuid.UUID | None = None) -> Dashboard:
        data["owner_id"] = owner_id
        return await self._repo.create_from_dict(data)
    async def update_dashboard(self, dashboard_id: uuid.UUID, data: dict) -> Dashboard:
        updated = await self._repo.update(dashboard_id, data)
        if updated is None: raise NotFoundException("Dashboard")
        return updated
    async def delete_dashboard(self, dashboard_id: uuid.UUID) -> None:
        if not await self._repo.delete(dashboard_id): raise NotFoundException("Dashboard")

class ReportService:
    def __init__(self, repo: ReportRepository) -> None:
        self._repo = repo
    async def list_reports(self, *, search=None, client_id=None, report_type=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, report_type=report_type, status=status, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, report_type=report_type, status=status)
        return items, total
    async def get_report(self, report_id: uuid.UUID) -> Report:
        r = await self._repo.get_by_id(report_id)
        if r is None: raise NotFoundException("Report")
        return r
    async def create_report(self, data: dict, generated_by: uuid.UUID | None = None) -> Report:
        data["generated_by"] = generated_by
        return await self._repo.create_from_dict(data)
    async def update_report(self, report_id: uuid.UUID, data: dict) -> Report:
        updated = await self._repo.update(report_id, data)
        if updated is None: raise NotFoundException("Report")
        return updated
    async def delete_report(self, report_id: uuid.UUID) -> None:
        if not await self._repo.delete(report_id): raise NotFoundException("Report")

class DataIntegrationService:
    def __init__(self, repo: DataIntegrationRepository) -> None:
        self._repo = repo
    async def list_integrations(self, *, client_id=None, provider_name=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(client_id=client_id, provider_name=provider_name, status=status, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(client_id=client_id, provider_name=provider_name, status=status)
        return items, total
    async def get_integration(self, integration_id: uuid.UUID) -> DataIntegration:
        i = await self._repo.get_by_id(integration_id)
        if i is None: raise NotFoundException("DataIntegration")
        return i
    async def create_integration(self, data: dict) -> DataIntegration:
        return await self._repo.create_from_dict(data)
    async def update_integration(self, integration_id: uuid.UUID, data: dict) -> DataIntegration:
        updated = await self._repo.update(integration_id, data)
        if updated is None: raise NotFoundException("DataIntegration")
        return updated
    async def delete_integration(self, integration_id: uuid.UUID) -> None:
        if not await self._repo.delete(integration_id): raise NotFoundException("DataIntegration")
