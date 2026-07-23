"""API routes for Creative."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.creative.dependencies import *
from app.modules.creative.schemas import *
from app.modules.creative.service import *

router = APIRouter(prefix="/creative", tags=["Creative"])

# ── Creative Projects ──
@router.get("/projects", response_model=PaginatedResponse[CreativeProjectRead], summary="List creative projects")
async def list_creative_projects(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    campaign_id: uuid.UUID | None = Query(None),
    project_status: str | None = Query(None, alias="status"),
    manager_id: uuid.UUID | None = Query(None),
    svc: CreativeProjectService = Depends(get_creative_project_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    items, total = await svc.list_projects(
        search=params.search, client_id=effective_client_id, campaign_id=campaign_id,
        status=project_status, manager_id=manager_id, sort_by=params.sort_by,
        sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[CreativeProjectRead].create(items=[CreativeProjectRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/projects", response_model=CreativeProjectRead, status_code=status.HTTP_201_CREATED, summary="Create creative project")
async def create_creative_project(payload: CreativeProjectCreate, db: AsyncSession = Depends(get_db), svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user)):
    p = await svc.create_project(payload.model_dump()); await db.commit()
    return CreativeProjectRead.model_validate(p)

@router.get("/projects/{project_id}", response_model=CreativeProjectRead, summary="Get creative project")
async def get_creative_project(project_id: uuid.UUID, svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return CreativeProjectRead.model_validate(await svc.get_project(project_id, scoped_client_id=scoped_client_id))

@router.put("/projects/{project_id}", response_model=CreativeProjectRead, summary="Update creative project")
async def update_creative_project(project_id: uuid.UUID, payload: CreativeProjectUpdate, db: AsyncSession = Depends(get_db), svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    p = await svc.update_project(project_id, payload.model_dump(exclude_unset=True), scoped_client_id=scoped_client_id); await db.commit()
    return CreativeProjectRead.model_validate(p)

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete creative project")
async def delete_creative_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await svc.delete_project(project_id, scoped_client_id=scoped_client_id); await db.commit()

# ── Creative Assets ──
@router.get("/projects/{project_id}/assets", response_model=list[CreativeAssetRead], summary="List creative assets")
async def list_creative_assets(project_id: uuid.UUID, svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await project_svc.get_project(project_id, scoped_client_id=scoped_client_id)
    return [CreativeAssetRead.model_validate(x) for x in await svc.list_assets(project_id)]

@router.post("/projects/{project_id}/assets", response_model=CreativeAssetRead, status_code=status.HTTP_201_CREATED, summary="Add creative asset")
async def create_creative_asset(project_id: uuid.UUID, payload: CreativeAssetCreate, db: AsyncSession = Depends(get_db), svc: CreativeAssetService = Depends(get_creative_asset_service), current_user: User = Depends(get_current_user)):
    a = await svc.create_asset(project_id, payload.model_dump(), designer_id=current_user.id); await db.commit()
    return CreativeAssetRead.model_validate(a)

@router.get("/assets/{asset_id}", response_model=CreativeAssetRead, summary="Get creative asset")
async def get_creative_asset(asset_id: uuid.UUID, svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    asset = await svc.get_asset(asset_id)
    if asset.project_id:
        await project_svc.get_project(asset.project_id, scoped_client_id=scoped_client_id)
    return CreativeAssetRead.model_validate(asset)

@router.put("/assets/{asset_id}", response_model=CreativeAssetRead, summary="Update creative asset")
async def update_creative_asset(asset_id: uuid.UUID, payload: CreativeAssetUpdate, db: AsyncSession = Depends(get_db), svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    existing = await svc.get_asset(asset_id)
    if existing.project_id:
        await project_svc.get_project(existing.project_id, scoped_client_id=scoped_client_id)
    a = await svc.update_asset(asset_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return CreativeAssetRead.model_validate(a)

@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete creative asset")
async def delete_creative_asset(asset_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    existing = await svc.get_asset(asset_id)
    if existing.project_id:
        await project_svc.get_project(existing.project_id, scoped_client_id=scoped_client_id)
    await svc.delete_asset(asset_id); await db.commit()

# ── Creative Feedback ──
@router.get("/assets/{asset_id}/feedback", response_model=list[CreativeFeedbackRead], summary="List creative feedback")
async def list_creative_feedback(asset_id: uuid.UUID, svc: CreativeFeedbackService = Depends(get_creative_feedback_service), asset_svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    asset = await asset_svc.get_asset(asset_id)
    if asset.project_id:
        await project_svc.get_project(asset.project_id, scoped_client_id=scoped_client_id)
    return [CreativeFeedbackRead.model_validate(x) for x in await svc.list_feedback(asset_id)]

@router.post("/assets/{asset_id}/feedback", response_model=CreativeFeedbackRead, status_code=status.HTTP_201_CREATED, summary="Add creative feedback")
async def create_creative_feedback(asset_id: uuid.UUID, payload: CreativeFeedbackCreate, db: AsyncSession = Depends(get_db), svc: CreativeFeedbackService = Depends(get_creative_feedback_service), asset_svc: CreativeAssetService = Depends(get_creative_asset_service), project_svc: CreativeProjectService = Depends(get_creative_project_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    asset = await asset_svc.get_asset(asset_id)
    if asset.project_id:
        await project_svc.get_project(asset.project_id, scoped_client_id=scoped_client_id)
    f = await svc.create_feedback(asset_id, payload.model_dump(), user_id=current_user.id); await db.commit()
    return CreativeFeedbackRead.model_validate(f)

@router.put("/feedback/{feedback_id}", response_model=CreativeFeedbackRead, summary="Update creative feedback")
async def update_creative_feedback(feedback_id: uuid.UUID, payload: CreativeFeedbackUpdate, db: AsyncSession = Depends(get_db), svc: CreativeFeedbackService = Depends(get_creative_feedback_service), _: User = Depends(get_current_user)):
    f = await svc.update_feedback(feedback_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return CreativeFeedbackRead.model_validate(f)

@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete creative feedback")
async def delete_creative_feedback(feedback_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: CreativeFeedbackService = Depends(get_creative_feedback_service), _: User = Depends(get_current_user)):
    await svc.delete_feedback(feedback_id); await db.commit()
