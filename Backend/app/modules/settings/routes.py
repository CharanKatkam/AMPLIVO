"""API routes for Settings."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.settings.dependencies import *
from app.modules.settings.schemas import *
from app.modules.settings.service import *

router = APIRouter(prefix="/settings", tags=["Settings"])

# ── System Settings ──
@router.get("/system", response_model=PaginatedResponse[SystemSettingRead], summary="List system settings")
async def list_system_settings(
    params: PaginationParams = Depends(),
    is_public: bool | None = Query(None),
    svc: SystemSettingService = Depends(get_system_setting_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_settings(
        search=params.search, is_public=is_public,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[SystemSettingRead].create(items=[SystemSettingRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/system", response_model=SystemSettingRead, status_code=status.HTTP_201_CREATED, summary="Create system setting")
async def create_system_setting(payload: SystemSettingCreate, db: AsyncSession = Depends(get_db), svc: SystemSettingService = Depends(get_system_setting_service), current_user: User = Depends(get_current_user)):
    s = await svc.create_setting(payload.model_dump(), updated_by=current_user.id); await db.commit()
    return SystemSettingRead.model_validate(s)

@router.get("/system/{setting_id}", response_model=SystemSettingRead, summary="Get system setting")
async def get_system_setting(setting_id: uuid.UUID, svc: SystemSettingService = Depends(get_system_setting_service), _: User = Depends(get_current_user)):
    return SystemSettingRead.model_validate(await svc.get_setting(setting_id))

@router.get("/system/key/{key}", response_model=SystemSettingRead, summary="Get system setting by key")
async def get_system_setting_by_key(key: str, svc: SystemSettingService = Depends(get_system_setting_service), _: User = Depends(get_current_user)):
    return SystemSettingRead.model_validate(await svc.get_by_key(key))

@router.put("/system/{setting_id}", response_model=SystemSettingRead, summary="Update system setting")
async def update_system_setting(setting_id: uuid.UUID, payload: SystemSettingUpdate, db: AsyncSession = Depends(get_db), svc: SystemSettingService = Depends(get_system_setting_service), current_user: User = Depends(get_current_user)):
    s = await svc.update_setting(setting_id, payload.model_dump(exclude_unset=True), updated_by=current_user.id); await db.commit()
    return SystemSettingRead.model_validate(s)

@router.delete("/system/{setting_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete system setting")
async def delete_system_setting(setting_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SystemSettingService = Depends(get_system_setting_service), _: User = Depends(get_current_user)):
    await svc.delete_setting(setting_id); await db.commit()

# ── User Preferences ──
@router.get("/user/me", response_model=UserPreferenceRead, summary="Get my preferences")
async def get_my_preferences(svc: UserPreferenceService = Depends(get_user_preference_service), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # We do a commit here because get_preference might create default settings
    p = await svc.get_preference(current_user.id); await db.commit()
    return UserPreferenceRead.model_validate(p)

@router.put("/user/me", response_model=UserPreferenceRead, summary="Update my preferences")
async def update_my_preferences(payload: UserPreferenceUpdate, db: AsyncSession = Depends(get_db), svc: UserPreferenceService = Depends(get_user_preference_service), current_user: User = Depends(get_current_user)):
    p = await svc.update_preference(current_user.id, payload.model_dump(exclude_unset=True)); await db.commit()
    return UserPreferenceRead.model_validate(p)
