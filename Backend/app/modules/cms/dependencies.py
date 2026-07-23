"""DI factories for CMS."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.cms.repository import *
from app.modules.cms.service import *

def get_content_category_service(db: AsyncSession = Depends(get_db)) -> ContentCategoryService:
    return ContentCategoryService(ContentCategoryRepository(db))

def get_content_item_service(db: AsyncSession = Depends(get_db)) -> ContentItemService:
    return ContentItemService(ContentItemRepository(db))
