"""Service layer for CMS."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.modules.cms.models import ContentCategory, ContentItem
from app.modules.cms.repository import ContentCategoryRepository, ContentItemRepository

class ContentCategoryService:
    def __init__(self, repo: ContentCategoryRepository) -> None:
        self._repo = repo
    async def list_categories(self, *, offset=0, limit=100) -> Sequence[ContentCategory]:
        return await self._repo.get_all(offset=offset, limit=limit)
    async def get_category(self, category_id: uuid.UUID) -> ContentCategory:
        c = await self._repo.get_by_id(category_id)
        if c is None: raise NotFoundException("ContentCategory")
        return c
    async def get_by_slug(self, slug: str) -> ContentCategory:
        c = await self._repo.get_by_slug(slug)
        if c is None: raise NotFoundException("ContentCategory")
        return c
    async def create_category(self, data: dict) -> ContentCategory:
        return await self._repo.create_from_dict(data)
    async def update_category(self, category_id: uuid.UUID, data: dict) -> ContentCategory:
        updated = await self._repo.update(category_id, data)
        if updated is None: raise NotFoundException("ContentCategory")
        return updated
    async def delete_category(self, category_id: uuid.UUID) -> None:
        if not await self._repo.delete(category_id): raise NotFoundException("ContentCategory")

class ContentItemService:
    def __init__(self, repo: ContentItemRepository) -> None:
        self._repo = repo
    async def list_items(self, *, search=None, status=None, content_type=None, category_id=None, author_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, status=status, content_type=content_type, category_id=category_id, author_id=author_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, status=status, content_type=content_type, category_id=category_id, author_id=author_id)
        return items, total
    async def get_item(self, item_id: uuid.UUID) -> ContentItem:
        i = await self._repo.get_detail(item_id)
        if i is None: raise NotFoundException("ContentItem")
        return i
    async def get_by_slug(self, slug: str) -> ContentItem:
        i = await self._repo.get_by_slug(slug)
        if i is None: raise NotFoundException("ContentItem")
        return i
    async def create_item(self, data: dict, author_id: uuid.UUID | None = None) -> ContentItem:
        data["author_id"] = author_id
        return await self._repo.create_from_dict(data)
    async def update_item(self, item_id: uuid.UUID, data: dict) -> ContentItem:
        updated = await self._repo.update(item_id, data)
        if updated is None: raise NotFoundException("ContentItem")
        return updated
    async def delete_item(self, item_id: uuid.UUID) -> None:
        if not await self._repo.delete(item_id): raise NotFoundException("ContentItem")
