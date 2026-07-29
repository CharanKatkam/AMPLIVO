"""Repository layer for CMS."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.cms.models import ContentCategory, ContentItem
from app.repositories.base import BaseRepository

class ContentCategoryRepository(BaseRepository[ContentCategory]):
    model = ContentCategory
    searchable_columns = [ContentCategory.name, ContentCategory.description]
    async def get_by_slug(self, slug: str) -> ContentCategory | None:
        r = await self._db.execute(select(ContentCategory).where(ContentCategory.slug == slug))
        return r.scalar_one_or_none()

class ContentItemRepository(BaseRepository[ContentItem]):
    model = ContentItem
    searchable_columns = [ContentItem.title, ContentItem.body]
    async def get_detail(self, item_id: uuid.UUID) -> ContentItem | None:
        stmt = select(ContentItem).options(selectinload(ContentItem.category)).where(ContentItem.id == item_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_by_slug(self, slug: str) -> ContentItem | None:
        stmt = select(ContentItem).options(selectinload(ContentItem.category)).where(ContentItem.slug == slug)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, status=None, content_type=None, category_id=None, author_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[ContentItem]:
        stmt = select(ContentItem)
        if status: stmt = stmt.where(ContentItem.status == status)
        if content_type: stmt = stmt.where(ContentItem.content_type == content_type)
        if category_id: stmt = stmt.where(ContentItem.category_id == category_id)
        if author_id: stmt = stmt.where(ContentItem.author_id == author_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=ContentItem, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, status=None, content_type=None, category_id=None, author_id=None) -> int:
        stmt = select(func.count()).select_from(ContentItem)
        if status: stmt = stmt.where(ContentItem.status == status)
        if content_type: stmt = stmt.where(ContentItem.content_type == content_type)
        if category_id: stmt = stmt.where(ContentItem.category_id == category_id)
        if author_id: stmt = stmt.where(ContentItem.author_id == author_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()
