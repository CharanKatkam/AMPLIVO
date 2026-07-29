"""API routes for Social."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.social.dependencies import *
from app.modules.social.schemas import *
from app.modules.social.service import *

router = APIRouter(prefix="/social", tags=["Social"])

# ── Profiles ──
@router.get("/profiles", response_model=PaginatedResponse[SocialProfileRead], summary="List social profiles")
async def list_social_profiles(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    platform: str | None = Query(None),
    profile_status: str | None = Query(None, alias="status"),
    svc: SocialProfileService = Depends(get_social_profile_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_profiles(
        search=params.search, client_id=client_id, platform=platform, status=profile_status,
        sort_by=params.sort_by, sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[SocialProfileRead].create(items=[SocialProfileRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/profiles", response_model=SocialProfileRead, status_code=status.HTTP_201_CREATED, summary="Create social profile")
async def create_social_profile(payload: SocialProfileCreate, db: AsyncSession = Depends(get_db), svc: SocialProfileService = Depends(get_social_profile_service), _: User = Depends(get_current_user)):
    p = await svc.create_profile(payload.model_dump()); await db.commit()
    return SocialProfileRead.model_validate(p)

@router.get("/profiles/{profile_id}", response_model=SocialProfileRead, summary="Get social profile")
async def get_social_profile(profile_id: uuid.UUID, svc: SocialProfileService = Depends(get_social_profile_service), _: User = Depends(get_current_user)):
    return SocialProfileRead.model_validate(await svc.get_profile(profile_id))

@router.put("/profiles/{profile_id}", response_model=SocialProfileRead, summary="Update social profile")
async def update_social_profile(profile_id: uuid.UUID, payload: SocialProfileUpdate, db: AsyncSession = Depends(get_db), svc: SocialProfileService = Depends(get_social_profile_service), _: User = Depends(get_current_user)):
    p = await svc.update_profile(profile_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SocialProfileRead.model_validate(p)

@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete social profile")
async def delete_social_profile(profile_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SocialProfileService = Depends(get_social_profile_service), _: User = Depends(get_current_user)):
    await svc.delete_profile(profile_id); await db.commit()

# ── Posts ──
@router.get("/profiles/{profile_id}/posts", response_model=list[SocialPostRead], summary="List social posts")
async def list_social_posts(profile_id: uuid.UUID, svc: SocialPostService = Depends(get_social_post_service), _: User = Depends(get_current_user)):
    return [SocialPostRead.model_validate(x) for x in await svc.list_posts(profile_id)]

@router.post("/profiles/{profile_id}/posts", response_model=SocialPostRead, status_code=status.HTTP_201_CREATED, summary="Add social post")
async def create_social_post(profile_id: uuid.UUID, payload: SocialPostCreate, db: AsyncSession = Depends(get_db), svc: SocialPostService = Depends(get_social_post_service), current_user: User = Depends(get_current_user)):
    p = await svc.create_post(profile_id, payload.model_dump(), author_id=current_user.id); await db.commit()
    return SocialPostRead.model_validate(p)

@router.get("/posts/{post_id}", response_model=SocialPostRead, summary="Get social post")
async def get_social_post(post_id: uuid.UUID, svc: SocialPostService = Depends(get_social_post_service), _: User = Depends(get_current_user)):
    return SocialPostRead.model_validate(await svc.get_post(post_id))

@router.put("/posts/{post_id}", response_model=SocialPostRead, summary="Update social post")
async def update_social_post(post_id: uuid.UUID, payload: SocialPostUpdate, db: AsyncSession = Depends(get_db), svc: SocialPostService = Depends(get_social_post_service), _: User = Depends(get_current_user)):
    p = await svc.update_post(post_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SocialPostRead.model_validate(p)

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete social post")
async def delete_social_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SocialPostService = Depends(get_social_post_service), _: User = Depends(get_current_user)):
    await svc.delete_post(post_id); await db.commit()

# ── Metrics ──
@router.get("/posts/{post_id}/metrics", response_model=list[SocialMetricRead], summary="List post metrics")
async def list_social_metrics(post_id: uuid.UUID, svc: SocialMetricService = Depends(get_social_metric_service), _: User = Depends(get_current_user)):
    return [SocialMetricRead.model_validate(x) for x in await svc.list_metrics(post_id)]

@router.post("/posts/{post_id}/metrics", response_model=SocialMetricRead, status_code=status.HTTP_201_CREATED, summary="Add post metric")
async def create_social_metric(post_id: uuid.UUID, payload: SocialMetricCreate, db: AsyncSession = Depends(get_db), svc: SocialMetricService = Depends(get_social_metric_service), _: User = Depends(get_current_user)):
    m = await svc.create_metric(post_id, payload.model_dump()); await db.commit()
    return SocialMetricRead.model_validate(m)

@router.put("/metrics/{metric_id}", response_model=SocialMetricRead, summary="Update post metric")
async def update_social_metric(metric_id: uuid.UUID, payload: SocialMetricUpdate, db: AsyncSession = Depends(get_db), svc: SocialMetricService = Depends(get_social_metric_service), _: User = Depends(get_current_user)):
    m = await svc.update_metric(metric_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SocialMetricRead.model_validate(m)

@router.delete("/metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete post metric")
async def delete_social_metric(metric_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SocialMetricService = Depends(get_social_metric_service), _: User = Depends(get_current_user)):
    await svc.delete_metric(metric_id); await db.commit()
