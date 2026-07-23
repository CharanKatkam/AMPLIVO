"""API routes for Paid Ads."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.paidads.dependencies import *
from app.modules.paidads.schemas import *
from app.modules.paidads.service import *

router = APIRouter(prefix="/paidads", tags=["Paid Ads"])

# ── Campaigns ──
@router.get("/campaigns", response_model=PaginatedResponse[AdCampaignRead], summary="List ad campaigns")
async def list_ad_campaigns(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    platform: str | None = Query(None),
    campaign_status: str | None = Query(None, alias="status"),
    manager_id: uuid.UUID | None = Query(None),
    svc: AdCampaignService = Depends(get_ad_campaign_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_campaigns(
        search=params.search, client_id=client_id, platform=platform, status=campaign_status,
        manager_id=manager_id, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[AdCampaignRead].create(items=[AdCampaignRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/campaigns", response_model=AdCampaignRead, status_code=status.HTTP_201_CREATED, summary="Create ad campaign")
async def create_ad_campaign(payload: AdCampaignCreate, db: AsyncSession = Depends(get_db), svc: AdCampaignService = Depends(get_ad_campaign_service), _: User = Depends(get_current_user)):
    c = await svc.create_campaign(payload.model_dump()); await db.commit()
    return AdCampaignRead.model_validate(c)

@router.get("/campaigns/{campaign_id}", response_model=AdCampaignRead, summary="Get ad campaign")
async def get_ad_campaign(campaign_id: uuid.UUID, svc: AdCampaignService = Depends(get_ad_campaign_service), _: User = Depends(get_current_user)):
    return AdCampaignRead.model_validate(await svc.get_campaign(campaign_id))

@router.put("/campaigns/{campaign_id}", response_model=AdCampaignRead, summary="Update ad campaign")
async def update_ad_campaign(campaign_id: uuid.UUID, payload: AdCampaignUpdate, db: AsyncSession = Depends(get_db), svc: AdCampaignService = Depends(get_ad_campaign_service), _: User = Depends(get_current_user)):
    c = await svc.update_campaign(campaign_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return AdCampaignRead.model_validate(c)

@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete ad campaign")
async def delete_ad_campaign(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: AdCampaignService = Depends(get_ad_campaign_service), _: User = Depends(get_current_user)):
    await svc.delete_campaign(campaign_id); await db.commit()

# ── Ad Groups ──
@router.get("/campaigns/{campaign_id}/groups", response_model=list[AdGroupRead], summary="List ad groups")
async def list_ad_groups(campaign_id: uuid.UUID, svc: AdGroupService = Depends(get_ad_group_service), _: User = Depends(get_current_user)):
    return [AdGroupRead.model_validate(x) for x in await svc.list_groups(campaign_id)]

@router.post("/campaigns/{campaign_id}/groups", response_model=AdGroupRead, status_code=status.HTTP_201_CREATED, summary="Add ad group")
async def create_ad_group(campaign_id: uuid.UUID, payload: AdGroupCreate, db: AsyncSession = Depends(get_db), svc: AdGroupService = Depends(get_ad_group_service), _: User = Depends(get_current_user)):
    g = await svc.create_group(campaign_id, payload.model_dump()); await db.commit()
    return AdGroupRead.model_validate(g)

@router.put("/groups/{group_id}", response_model=AdGroupRead, summary="Update ad group")
async def update_ad_group(group_id: uuid.UUID, payload: AdGroupUpdate, db: AsyncSession = Depends(get_db), svc: AdGroupService = Depends(get_ad_group_service), _: User = Depends(get_current_user)):
    g = await svc.update_group(group_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return AdGroupRead.model_validate(g)

@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete ad group")
async def delete_ad_group(group_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: AdGroupService = Depends(get_ad_group_service), _: User = Depends(get_current_user)):
    await svc.delete_group(group_id); await db.commit()

# ── Metrics ──
@router.get("/campaigns/{campaign_id}/metrics", response_model=list[AdMetricRead], summary="List ad metrics")
async def list_ad_metrics(campaign_id: uuid.UUID, svc: AdMetricService = Depends(get_ad_metric_service), _: User = Depends(get_current_user)):
    return [AdMetricRead.model_validate(x) for x in await svc.list_metrics(campaign_id)]

@router.post("/campaigns/{campaign_id}/metrics", response_model=AdMetricRead, status_code=status.HTTP_201_CREATED, summary="Add ad metric")
async def create_ad_metric(campaign_id: uuid.UUID, payload: AdMetricCreate, db: AsyncSession = Depends(get_db), svc: AdMetricService = Depends(get_ad_metric_service), _: User = Depends(get_current_user)):
    m = await svc.create_metric(campaign_id, payload.model_dump()); await db.commit()
    return AdMetricRead.model_validate(m)

@router.put("/metrics/{metric_id}", response_model=AdMetricRead, summary="Update ad metric")
async def update_ad_metric(metric_id: uuid.UUID, payload: AdMetricUpdate, db: AsyncSession = Depends(get_db), svc: AdMetricService = Depends(get_ad_metric_service), _: User = Depends(get_current_user)):
    m = await svc.update_metric(metric_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return AdMetricRead.model_validate(m)

@router.delete("/metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete ad metric")
async def delete_ad_metric(metric_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: AdMetricService = Depends(get_ad_metric_service), _: User = Depends(get_current_user)):
    await svc.delete_metric(metric_id); await db.commit()
