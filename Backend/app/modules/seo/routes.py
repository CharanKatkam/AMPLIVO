"""API routes for SEO."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.seo.dependencies import *
from app.modules.seo.schemas import *
from app.modules.seo.service import *

router = APIRouter(prefix="/seo", tags=["SEO"])

# ── SEO Projects ──
@router.get("/projects", response_model=PaginatedResponse[SeoProjectRead], summary="List SEO projects")
async def list_seo_projects(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    project_status: str | None = Query(None, alias="status"),
    manager_id: uuid.UUID | None = Query(None),
    svc: SeoProjectService = Depends(get_seo_project_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    items, total = await svc.list_projects(
        search=params.search, client_id=effective_client_id, status=project_status,
        manager_id=manager_id, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[SeoProjectRead].create(items=[SeoProjectRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/projects", response_model=SeoProjectRead, status_code=status.HTTP_201_CREATED, summary="Create SEO project")
async def create_seo_project(payload: SeoProjectCreate, db: AsyncSession = Depends(get_db), svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user)):
    p = await svc.create_project(payload.model_dump()); await db.commit()
    return SeoProjectRead.model_validate(p)

@router.get("/projects/{project_id}", response_model=SeoProjectRead, summary="Get SEO project")
async def get_seo_project(project_id: uuid.UUID, svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return SeoProjectRead.model_validate(await svc.get_project(project_id, scoped_client_id=scoped_client_id))

@router.put("/projects/{project_id}", response_model=SeoProjectRead, summary="Update SEO project")
async def update_seo_project(project_id: uuid.UUID, payload: SeoProjectUpdate, db: AsyncSession = Depends(get_db), svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    p = await svc.update_project(project_id, payload.model_dump(exclude_unset=True), scoped_client_id=scoped_client_id); await db.commit()
    return SeoProjectRead.model_validate(p)

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete SEO project")
async def delete_seo_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await svc.delete_project(project_id, scoped_client_id=scoped_client_id); await db.commit()

# ── Keywords ──
@router.get("/projects/{project_id}/keywords", response_model=list[SeoKeywordRead], summary="List keywords")
async def list_seo_keywords(project_id: uuid.UUID, svc: SeoKeywordService = Depends(get_seo_keyword_service), project_svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await project_svc.get_project(project_id, scoped_client_id=scoped_client_id)
    return [SeoKeywordRead.model_validate(x) for x in await svc.list_keywords(project_id)]

@router.post("/projects/{project_id}/keywords", response_model=SeoKeywordRead, status_code=status.HTTP_201_CREATED, summary="Add keyword")
async def create_seo_keyword(project_id: uuid.UUID, payload: SeoKeywordCreate, db: AsyncSession = Depends(get_db), svc: SeoKeywordService = Depends(get_seo_keyword_service), _: User = Depends(get_current_user)):
    k = await svc.create_keyword(project_id, payload.model_dump()); await db.commit()
    return SeoKeywordRead.model_validate(k)

@router.put("/keywords/{keyword_id}", response_model=SeoKeywordRead, summary="Update keyword")
async def update_seo_keyword(keyword_id: uuid.UUID, payload: SeoKeywordUpdate, db: AsyncSession = Depends(get_db), svc: SeoKeywordService = Depends(get_seo_keyword_service), _: User = Depends(get_current_user)):
    k = await svc.update_keyword(keyword_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SeoKeywordRead.model_validate(k)

@router.delete("/keywords/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete keyword")
async def delete_seo_keyword(keyword_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SeoKeywordService = Depends(get_seo_keyword_service), _: User = Depends(get_current_user)):
    await svc.delete_keyword(keyword_id); await db.commit()

# ── Audits ──
@router.get("/projects/{project_id}/audits", response_model=list[SeoAuditRead], summary="List SEO audits")
async def list_seo_audits(project_id: uuid.UUID, svc: SeoAuditService = Depends(get_seo_audit_service), project_svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await project_svc.get_project(project_id, scoped_client_id=scoped_client_id)
    return [SeoAuditRead.model_validate(x) for x in await svc.list_audits(project_id)]

@router.post("/projects/{project_id}/audits", response_model=SeoAuditRead, status_code=status.HTTP_201_CREATED, summary="Add SEO audit")
async def create_seo_audit(project_id: uuid.UUID, payload: SeoAuditCreate, db: AsyncSession = Depends(get_db), svc: SeoAuditService = Depends(get_seo_audit_service), current_user: User = Depends(get_current_user)):
    a = await svc.create_audit(project_id, payload.model_dump(), conducted_by=current_user.id); await db.commit()
    return SeoAuditRead.model_validate(a)

@router.put("/audits/{audit_id}", response_model=SeoAuditRead, summary="Update SEO audit")
async def update_seo_audit(audit_id: uuid.UUID, payload: SeoAuditUpdate, db: AsyncSession = Depends(get_db), svc: SeoAuditService = Depends(get_seo_audit_service), _: User = Depends(get_current_user)):
    a = await svc.update_audit(audit_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SeoAuditRead.model_validate(a)

@router.delete("/audits/{audit_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete SEO audit")
async def delete_seo_audit(audit_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SeoAuditService = Depends(get_seo_audit_service), _: User = Depends(get_current_user)):
    await svc.delete_audit(audit_id); await db.commit()

# ── Backlinks ──
@router.get("/projects/{project_id}/backlinks", response_model=list[SeoBacklinkRead], summary="List backlinks")
async def list_seo_backlinks(project_id: uuid.UUID, svc: SeoBacklinkService = Depends(get_seo_backlink_service), project_svc: SeoProjectService = Depends(get_seo_project_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await project_svc.get_project(project_id, scoped_client_id=scoped_client_id)
    return [SeoBacklinkRead.model_validate(x) for x in await svc.list_backlinks(project_id)]

@router.post("/projects/{project_id}/backlinks", response_model=SeoBacklinkRead, status_code=status.HTTP_201_CREATED, summary="Add backlink")
async def create_seo_backlink(project_id: uuid.UUID, payload: SeoBacklinkCreate, db: AsyncSession = Depends(get_db), svc: SeoBacklinkService = Depends(get_seo_backlink_service), _: User = Depends(get_current_user)):
    b = await svc.create_backlink(project_id, payload.model_dump()); await db.commit()
    return SeoBacklinkRead.model_validate(b)

@router.put("/backlinks/{backlink_id}", response_model=SeoBacklinkRead, summary="Update backlink")
async def update_seo_backlink(backlink_id: uuid.UUID, payload: SeoBacklinkUpdate, db: AsyncSession = Depends(get_db), svc: SeoBacklinkService = Depends(get_seo_backlink_service), _: User = Depends(get_current_user)):
    b = await svc.update_backlink(backlink_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return SeoBacklinkRead.model_validate(b)

@router.delete("/backlinks/{backlink_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete backlink")
async def delete_seo_backlink(backlink_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SeoBacklinkService = Depends(get_seo_backlink_service), _: User = Depends(get_current_user)):
    await svc.delete_backlink(backlink_id); await db.commit()
