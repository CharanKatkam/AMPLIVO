"""API routes for Client Portal."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.client_portal.dependencies import *
from app.modules.client_portal.schemas import *
from app.modules.client_portal.service import *

router = APIRouter(prefix="/portal", tags=["Client Portal"])

# ── Settings ──
@router.get("/settings/{client_id}", response_model=PortalSettingRead, summary="Get portal setting")
async def get_portal_setting(client_id: uuid.UUID, svc: PortalSettingService = Depends(get_portal_setting_service), _: User = Depends(get_current_user)):
    return PortalSettingRead.model_validate(await svc.get_setting(client_id))

@router.put("/settings/{client_id}", response_model=PortalSettingRead, summary="Upsert portal setting")
async def upsert_portal_setting(client_id: uuid.UUID, payload: PortalSettingUpdate, db: AsyncSession = Depends(get_db), svc: PortalSettingService = Depends(get_portal_setting_service), _: User = Depends(get_current_user)):
    s = await svc.upsert_setting(client_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return PortalSettingRead.model_validate(s)

# ── Announcements ──
@router.get("/announcements", response_model=PaginatedResponse[PortalAnnouncementRead], summary="List portal announcements")
async def list_portal_announcements(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    is_active: bool | None = Query(None),
    svc: PortalAnnouncementService = Depends(get_portal_announcement_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_announcements(
        search=params.search, client_id=client_id, is_active=is_active,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[PortalAnnouncementRead].create(items=[PortalAnnouncementRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/announcements", response_model=PortalAnnouncementRead, status_code=status.HTTP_201_CREATED, summary="Create portal announcement")
async def create_portal_announcement(payload: PortalAnnouncementCreate, db: AsyncSession = Depends(get_db), svc: PortalAnnouncementService = Depends(get_portal_announcement_service), current_user: User = Depends(get_current_user)):
    a = await svc.create_announcement(payload.model_dump(), author_id=current_user.id); await db.commit()
    return PortalAnnouncementRead.model_validate(a)

@router.get("/announcements/{announcement_id}", response_model=PortalAnnouncementRead, summary="Get portal announcement")
async def get_portal_announcement(announcement_id: uuid.UUID, svc: PortalAnnouncementService = Depends(get_portal_announcement_service), _: User = Depends(get_current_user)):
    return PortalAnnouncementRead.model_validate(await svc.get_announcement(announcement_id))

@router.put("/announcements/{announcement_id}", response_model=PortalAnnouncementRead, summary="Update portal announcement")
async def update_portal_announcement(announcement_id: uuid.UUID, payload: PortalAnnouncementUpdate, db: AsyncSession = Depends(get_db), svc: PortalAnnouncementService = Depends(get_portal_announcement_service), _: User = Depends(get_current_user)):
    a = await svc.update_announcement(announcement_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return PortalAnnouncementRead.model_validate(a)

@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete portal announcement")
async def delete_portal_announcement(announcement_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: PortalAnnouncementService = Depends(get_portal_announcement_service), _: User = Depends(get_current_user)):
    await svc.delete_announcement(announcement_id); await db.commit()

# ── Resources ──
@router.get("/resources", response_model=PaginatedResponse[PortalResourceRead], summary="List portal resources")
async def list_portal_resources(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    resource_type: str | None = Query(None),
    svc: PortalResourceService = Depends(get_portal_resource_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_resources(
        search=params.search, client_id=client_id, resource_type=resource_type,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[PortalResourceRead].create(items=[PortalResourceRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/resources", response_model=PortalResourceRead, status_code=status.HTTP_201_CREATED, summary="Add portal resource")
async def create_portal_resource(payload: PortalResourceCreate, db: AsyncSession = Depends(get_db), svc: PortalResourceService = Depends(get_portal_resource_service), current_user: User = Depends(get_current_user)):
    r = await svc.create_resource(payload.model_dump(), uploaded_by=current_user.id); await db.commit()
    return PortalResourceRead.model_validate(r)

@router.get("/resources/{resource_id}", response_model=PortalResourceRead, summary="Get portal resource")
async def get_portal_resource(resource_id: uuid.UUID, svc: PortalResourceService = Depends(get_portal_resource_service), _: User = Depends(get_current_user)):
    return PortalResourceRead.model_validate(await svc.get_resource(resource_id))

@router.put("/resources/{resource_id}", response_model=PortalResourceRead, summary="Update portal resource")
async def update_portal_resource(resource_id: uuid.UUID, payload: PortalResourceUpdate, db: AsyncSession = Depends(get_db), svc: PortalResourceService = Depends(get_portal_resource_service), _: User = Depends(get_current_user)):
    r = await svc.update_resource(resource_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return PortalResourceRead.model_validate(r)

@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete portal resource")
async def delete_portal_resource(resource_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: PortalResourceService = Depends(get_portal_resource_service), _: User = Depends(get_current_user)):
    await svc.delete_resource(resource_id); await db.commit()
