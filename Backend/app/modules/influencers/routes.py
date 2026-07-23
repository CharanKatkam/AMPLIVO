"""API routes for Influencers."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.influencers.dependencies import *
from app.modules.influencers.schemas import *
from app.modules.influencers.service import *

router = APIRouter(prefix="/influencers", tags=["Influencers"])

# ── Influencers ──
@router.get("", response_model=PaginatedResponse[InfluencerRead], summary="List influencers")
async def list_influencers(
    params: PaginationParams = Depends(),
    platform: str | None = Query(None),
    influencer_status: str | None = Query(None, alias="status"),
    svc: InfluencerService = Depends(get_influencer_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_influencers(
        search=params.search, platform=platform, status=influencer_status,
        sort_by=params.sort_by, sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[InfluencerRead].create(items=[InfluencerRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("", response_model=InfluencerRead, status_code=status.HTTP_201_CREATED, summary="Create influencer")
async def create_influencer(payload: InfluencerCreate, db: AsyncSession = Depends(get_db), svc: InfluencerService = Depends(get_influencer_service), _: User = Depends(get_current_user)):
    i = await svc.create_influencer(payload.model_dump()); await db.commit()
    return InfluencerRead.model_validate(i)

@router.get("/{influencer_id}", response_model=InfluencerRead, summary="Get influencer")
async def get_influencer(influencer_id: uuid.UUID, svc: InfluencerService = Depends(get_influencer_service), _: User = Depends(get_current_user)):
    return InfluencerRead.model_validate(await svc.get_influencer(influencer_id))

@router.put("/{influencer_id}", response_model=InfluencerRead, summary="Update influencer")
async def update_influencer(influencer_id: uuid.UUID, payload: InfluencerUpdate, db: AsyncSession = Depends(get_db), svc: InfluencerService = Depends(get_influencer_service), _: User = Depends(get_current_user)):
    i = await svc.update_influencer(influencer_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return InfluencerRead.model_validate(i)

@router.delete("/{influencer_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete influencer")
async def delete_influencer(influencer_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: InfluencerService = Depends(get_influencer_service), _: User = Depends(get_current_user)):
    await svc.delete_influencer(influencer_id); await db.commit()

# ── Campaigns ──
@router.get("/{influencer_id}/campaigns", response_model=list[InfluencerCampaignRead], summary="List influencer campaigns")
async def list_influencer_campaigns(influencer_id: uuid.UUID, svc: InfluencerCampaignService = Depends(get_influencer_campaign_service), _: User = Depends(get_current_user)):
    return [InfluencerCampaignRead.model_validate(x) for x in await svc.list_campaigns(influencer_id)]

@router.post("/{influencer_id}/campaigns", response_model=InfluencerCampaignRead, status_code=status.HTTP_201_CREATED, summary="Add influencer campaign")
async def create_influencer_campaign(influencer_id: uuid.UUID, payload: InfluencerCampaignCreate, db: AsyncSession = Depends(get_db), svc: InfluencerCampaignService = Depends(get_influencer_campaign_service), _: User = Depends(get_current_user)):
    c = await svc.create_campaign(influencer_id, payload.model_dump()); await db.commit()
    return InfluencerCampaignRead.model_validate(c)

@router.put("/campaigns/{campaign_id}", response_model=InfluencerCampaignRead, summary="Update influencer campaign")
async def update_influencer_campaign(campaign_id: uuid.UUID, payload: InfluencerCampaignUpdate, db: AsyncSession = Depends(get_db), svc: InfluencerCampaignService = Depends(get_influencer_campaign_service), _: User = Depends(get_current_user)):
    c = await svc.update_campaign(campaign_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return InfluencerCampaignRead.model_validate(c)

@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete influencer campaign")
async def delete_influencer_campaign(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: InfluencerCampaignService = Depends(get_influencer_campaign_service), _: User = Depends(get_current_user)):
    await svc.delete_campaign(campaign_id); await db.commit()

# ── Contracts ──
@router.get("/{influencer_id}/contracts", response_model=list[InfluencerContractRead], summary="List influencer contracts")
async def list_influencer_contracts(influencer_id: uuid.UUID, svc: InfluencerContractService = Depends(get_influencer_contract_service), _: User = Depends(get_current_user)):
    return [InfluencerContractRead.model_validate(x) for x in await svc.list_contracts(influencer_id)]

@router.post("/{influencer_id}/contracts", response_model=InfluencerContractRead, status_code=status.HTTP_201_CREATED, summary="Add influencer contract")
async def create_influencer_contract(influencer_id: uuid.UUID, payload: InfluencerContractCreate, db: AsyncSession = Depends(get_db), svc: InfluencerContractService = Depends(get_influencer_contract_service), _: User = Depends(get_current_user)):
    c = await svc.create_contract(influencer_id, payload.model_dump()); await db.commit()
    return InfluencerContractRead.model_validate(c)

@router.put("/contracts/{contract_id}", response_model=InfluencerContractRead, summary="Update influencer contract")
async def update_influencer_contract(contract_id: uuid.UUID, payload: InfluencerContractUpdate, db: AsyncSession = Depends(get_db), svc: InfluencerContractService = Depends(get_influencer_contract_service), _: User = Depends(get_current_user)):
    c = await svc.update_contract(contract_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return InfluencerContractRead.model_validate(c)

@router.delete("/contracts/{contract_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete influencer contract")
async def delete_influencer_contract(contract_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: InfluencerContractService = Depends(get_influencer_contract_service), _: User = Depends(get_current_user)):
    await svc.delete_contract(contract_id); await db.commit()
