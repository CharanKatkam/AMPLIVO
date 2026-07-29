"""API routes for CMS."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.cms.dependencies import *
from app.modules.cms.schemas import *
from app.modules.cms.service import *

router = APIRouter(prefix="/cms", tags=["CMS"])

# ── Categories ──
@router.get("/categories", response_model=list[ContentCategoryRead], summary="List categories")
async def list_categories(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    svc: ContentCategoryService = Depends(get_content_category_service),
    _: User = Depends(get_current_user),
):
    return [ContentCategoryRead.model_validate(x) for x in await svc.list_categories(offset=offset, limit=limit)]

@router.post("/categories", response_model=ContentCategoryRead, status_code=status.HTTP_201_CREATED, summary="Create category")
async def create_category(payload: ContentCategoryCreate, db: AsyncSession = Depends(get_db), svc: ContentCategoryService = Depends(get_content_category_service), _: User = Depends(get_current_user)):
    c = await svc.create_category(payload.model_dump()); await db.commit()
    return ContentCategoryRead.model_validate(c)

@router.get("/categories/{category_id}", response_model=ContentCategoryRead, summary="Get category")
async def get_category(category_id: uuid.UUID, svc: ContentCategoryService = Depends(get_content_category_service), _: User = Depends(get_current_user)):
    return ContentCategoryRead.model_validate(await svc.get_category(category_id))

@router.get("/categories/slug/{slug}", response_model=ContentCategoryRead, summary="Get category by slug")
async def get_category_by_slug(slug: str, svc: ContentCategoryService = Depends(get_content_category_service), _: User = Depends(get_current_user)):
    return ContentCategoryRead.model_validate(await svc.get_by_slug(slug))

@router.put("/categories/{category_id}", response_model=ContentCategoryRead, summary="Update category")
async def update_category(category_id: uuid.UUID, payload: ContentCategoryUpdate, db: AsyncSession = Depends(get_db), svc: ContentCategoryService = Depends(get_content_category_service), _: User = Depends(get_current_user)):
    c = await svc.update_category(category_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return ContentCategoryRead.model_validate(c)

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete category")
async def delete_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: ContentCategoryService = Depends(get_content_category_service), _: User = Depends(get_current_user)):
    await svc.delete_category(category_id); await db.commit()

# ── Content Items ──
@router.get("/items", response_model=PaginatedResponse[ContentItemRead], summary="List content items")
async def list_content_items(
    params: PaginationParams = Depends(),
    content_status: str | None = Query(None, alias="status"),
    content_type: str | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    author_id: uuid.UUID | None = Query(None),
    svc: ContentItemService = Depends(get_content_item_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_items(
        search=params.search, status=content_status, content_type=content_type,
        category_id=category_id, author_id=author_id,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[ContentItemRead].create(items=[ContentItemRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/items", response_model=ContentItemRead, status_code=status.HTTP_201_CREATED, summary="Create content item")
async def create_content_item(payload: ContentItemCreate, db: AsyncSession = Depends(get_db), svc: ContentItemService = Depends(get_content_item_service), current_user: User = Depends(get_current_user)):
    i = await svc.create_item(payload.model_dump(), author_id=current_user.id); await db.commit()
    return ContentItemRead.model_validate(i)

@router.get("/items/{item_id}", response_model=ContentItemRead, summary="Get content item")
async def get_content_item(item_id: uuid.UUID, svc: ContentItemService = Depends(get_content_item_service), _: User = Depends(get_current_user)):
    return ContentItemRead.model_validate(await svc.get_item(item_id))

@router.get("/items/slug/{slug}", response_model=ContentItemRead, summary="Get content item by slug")
async def get_content_item_by_slug(slug: str, svc: ContentItemService = Depends(get_content_item_service), _: User = Depends(get_current_user)):
    return ContentItemRead.model_validate(await svc.get_by_slug(slug))

@router.put("/items/{item_id}", response_model=ContentItemRead, summary="Update content item")
async def update_content_item(item_id: uuid.UUID, payload: ContentItemUpdate, db: AsyncSession = Depends(get_db), svc: ContentItemService = Depends(get_content_item_service), _: User = Depends(get_current_user)):
    i = await svc.update_item(item_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return ContentItemRead.model_validate(i)

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete content item")
async def delete_content_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: ContentItemService = Depends(get_content_item_service), _: User = Depends(get_current_user)):
    await svc.delete_item(item_id); await db.commit()
