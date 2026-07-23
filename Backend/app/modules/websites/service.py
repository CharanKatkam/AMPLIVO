"""Service layer for Websites."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.websites.models import Website, WebsiteMetric, WebsitePage
from app.modules.websites.repository import WebsiteMetricRepository, WebsitePageRepository, WebsiteRepository

class WebsiteService:
    def __init__(self, repo: WebsiteRepository) -> None:
        self._repo = repo
    async def list_websites(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id)
        return items, total
    async def get_website(self, website_id: uuid.UUID) -> Website:
        w = await self._repo.get_detail(website_id)
        if w is None: raise NotFoundException("Website")
        return w
    async def create_website(self, data: dict) -> Website:
        return await self._repo.create_from_dict(data)
    async def update_website(self, website_id: uuid.UUID, data: dict) -> Website:
        updated = await self._repo.update(website_id, data)
        if updated is None: raise NotFoundException("Website")
        return updated
    async def delete_website(self, website_id: uuid.UUID) -> None:
        if not await self._repo.delete(website_id): raise NotFoundException("Website")

class WebsitePageService:
    def __init__(self, repo: WebsitePageRepository) -> None:
        self._repo = repo
    async def list_pages(self, website_id: uuid.UUID) -> Sequence[WebsitePage]:
        return await self._repo.list_by_website(website_id)
    async def create_page(self, website_id: uuid.UUID, data: dict) -> WebsitePage:
        data["website_id"] = website_id
        return await self._repo.create_from_dict(data)
    async def update_page(self, page_id: uuid.UUID, data: dict) -> WebsitePage:
        updated = await self._repo.update(page_id, data)
        if updated is None: raise NotFoundException("WebsitePage")
        return updated
    async def delete_page(self, page_id: uuid.UUID) -> None:
        if not await self._repo.delete(page_id): raise NotFoundException("WebsitePage")

class WebsiteMetricService:
    def __init__(self, repo: WebsiteMetricRepository) -> None:
        self._repo = repo
    async def list_metrics(self, website_id: uuid.UUID) -> Sequence[WebsiteMetric]:
        return await self._repo.list_by_website(website_id)
    async def create_metric(self, website_id: uuid.UUID, data: dict) -> WebsiteMetric:
        data["website_id"] = website_id
        return await self._repo.create_from_dict(data)
    async def update_metric(self, metric_id: uuid.UUID, data: dict) -> WebsiteMetric:
        updated = await self._repo.update(metric_id, data)
        if updated is None: raise NotFoundException("WebsiteMetric")
        return updated
    async def delete_metric(self, metric_id: uuid.UUID) -> None:
        if not await self._repo.delete(metric_id): raise NotFoundException("WebsiteMetric")
