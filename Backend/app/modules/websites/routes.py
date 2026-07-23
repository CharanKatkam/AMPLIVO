"""API routes for Websites."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.websites.dependencies import *
from app.modules.websites.schemas import *
from app.modules.websites.service import *

router = APIRouter(prefix="/websites", tags=["Websites"])

# ── Websites ──
@router.get("", response_model=PaginatedResponse[WebsiteRead], summary="List websites")
async def list_websites(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    website_status: str | None = Query(None, alias="status"),
    manager_id: uuid.UUID | None = Query(None),
    svc: WebsiteService = Depends(get_website_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_websites(
        search=params.search, client_id=client_id, status=website_status,
        manager_id=manager_id, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[WebsiteRead].create(items=[WebsiteRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("", response_model=WebsiteRead, status_code=status.HTTP_201_CREATED, summary="Create website")
async def create_website(payload: WebsiteCreate, db: AsyncSession = Depends(get_db), svc: WebsiteService = Depends(get_website_service), _: User = Depends(get_current_user)):
    w = await svc.create_website(payload.model_dump()); await db.commit()
    return WebsiteRead.model_validate(w)

@router.get("/{website_id}", response_model=WebsiteRead, summary="Get website")
async def get_website(website_id: uuid.UUID, svc: WebsiteService = Depends(get_website_service), _: User = Depends(get_current_user)):
    return WebsiteRead.model_validate(await svc.get_website(website_id))

@router.put("/{website_id}", response_model=WebsiteRead, summary="Update website")
async def update_website(website_id: uuid.UUID, payload: WebsiteUpdate, db: AsyncSession = Depends(get_db), svc: WebsiteService = Depends(get_website_service), _: User = Depends(get_current_user)):
    w = await svc.update_website(website_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return WebsiteRead.model_validate(w)

@router.delete("/{website_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete website")
async def delete_website(website_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: WebsiteService = Depends(get_website_service), _: User = Depends(get_current_user)):
    await svc.delete_website(website_id); await db.commit()

# ── Pages ──
@router.get("/{website_id}/pages", response_model=list[WebsitePageRead], summary="List website pages")
async def list_website_pages(website_id: uuid.UUID, svc: WebsitePageService = Depends(get_website_page_service), _: User = Depends(get_current_user)):
    return [WebsitePageRead.model_validate(x) for x in await svc.list_pages(website_id)]

@router.post("/{website_id}/pages", response_model=WebsitePageRead, status_code=status.HTTP_201_CREATED, summary="Add website page")
async def create_website_page(website_id: uuid.UUID, payload: WebsitePageCreate, db: AsyncSession = Depends(get_db), svc: WebsitePageService = Depends(get_website_page_service), _: User = Depends(get_current_user)):
    p = await svc.create_page(website_id, payload.model_dump()); await db.commit()
    return WebsitePageRead.model_validate(p)

@router.put("/pages/{page_id}", response_model=WebsitePageRead, summary="Update website page")
async def update_website_page(page_id: uuid.UUID, payload: WebsitePageUpdate, db: AsyncSession = Depends(get_db), svc: WebsitePageService = Depends(get_website_page_service), _: User = Depends(get_current_user)):
    p = await svc.update_page(page_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return WebsitePageRead.model_validate(p)

@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete website page")
async def delete_website_page(page_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: WebsitePageService = Depends(get_website_page_service), _: User = Depends(get_current_user)):
    await svc.delete_page(page_id); await db.commit()

# ── Metrics ──
@router.get("/{website_id}/metrics", response_model=list[WebsiteMetricRead], summary="List website metrics")
async def list_website_metrics(website_id: uuid.UUID, svc: WebsiteMetricService = Depends(get_website_metric_service), _: User = Depends(get_current_user)):
    return [WebsiteMetricRead.model_validate(x) for x in await svc.list_metrics(website_id)]

@router.post("/{website_id}/metrics", response_model=WebsiteMetricRead, status_code=status.HTTP_201_CREATED, summary="Add website metric")
async def create_website_metric(website_id: uuid.UUID, payload: WebsiteMetricCreate, db: AsyncSession = Depends(get_db), svc: WebsiteMetricService = Depends(get_website_metric_service), _: User = Depends(get_current_user)):
    m = await svc.create_metric(website_id, payload.model_dump()); await db.commit()
    return WebsiteMetricRead.model_validate(m)

@router.put("/metrics/{metric_id}", response_model=WebsiteMetricRead, summary="Update website metric")
async def update_website_metric(metric_id: uuid.UUID, payload: WebsiteMetricUpdate, db: AsyncSession = Depends(get_db), svc: WebsiteMetricService = Depends(get_website_metric_service), _: User = Depends(get_current_user)):
    m = await svc.update_metric(metric_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return WebsiteMetricRead.model_validate(m)

@router.delete("/metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete website metric")
async def delete_website_metric(metric_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: WebsiteMetricService = Depends(get_website_metric_service), _: User = Depends(get_current_user)):
    await svc.delete_metric(metric_id); await db.commit()
