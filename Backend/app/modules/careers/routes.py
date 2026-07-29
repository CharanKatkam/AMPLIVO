"""Routes for the Careers module.

Candidates have no account, so job listing/detail and application submission
stay public. Every HR-internal mutation (managing openings, viewing/updating
applications, interviews, offers) requires an authenticated `hr`/`admin` user
— this router previously had zero authentication on any route at all.

Also fixes a critical pre-existing bug: no route in this module ever called
`db.commit()` (confirmed present before this pass touched the file), so every
write silently rolled back at the end of the request — nothing here ever
actually persisted. Every mutating route below now commits explicitly,
matching the pattern used by every other module (leads, crm, finance, meetings).
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.rbac import require_roles
from app.models.user import User
from app.modules.careers.analytics_service import CareersAnalyticsService
from app.modules.careers.dependencies import get_career_service, get_interview_service, get_offer_service
from app.modules.careers.schemas import (
    InterviewCompleteRequest, InterviewCreate, InterviewRead, InterviewUpdate,
    JobApplicationCreate, JobApplicationRead, JobApplicationUpdate,
    JobOpeningCreate, JobOpeningRead, JobOpeningUpdate,
    OfferCreate, OfferRead, OfferUpdate,
)
from app.modules.careers.service import InterviewService, JobOpeningService, OfferService

router = APIRouter(prefix="/careers", tags=["Careers"])


# ── Job Openings (list/detail public — candidates browse without an account) ──

@router.get("", response_model=list[JobOpeningRead])
async def list_openings(skip: int = 0, limit: int = 100, service: JobOpeningService = Depends(get_career_service)):
    return await service.list_all(skip=skip, limit=limit)


# NOTE: these fixed-path routes must stay registered before "/{id}" — Starlette
# would otherwise match "/careers/dashboard-stats" against the {id}: uuid.UUID
# route first and return a 422 instead of reaching these handlers (the same
# gotcha already hit once in the Sales module's /leads router).
@router.get("/dashboard-stats", summary="HR recruitment dashboard rollup (live, no mock data)")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _role: str = Depends(require_roles("hr")),
):
    return await CareersAnalyticsService(db).get_dashboard_stats(current_user_id=current_user.id)


@router.get("/hr-reports", summary="HR recruitment reports (hiring funnel/department/time-to-hire/offer-acceptance)")
async def get_hr_reports(
    report_type: str = Query(..., alias="type"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("hr")),
):
    return await CareersAnalyticsService(db).get_report(report_type)


@router.get("/applications", response_model=list[JobApplicationRead], summary="List all applications (optional job/status filter)")
async def list_all_applications(
    job_opening_id: uuid.UUID | None = Query(None),
    application_status: str | None = Query(None, alias="status"),
    skip: int = 0, limit: int = 200,
    service: JobOpeningService = Depends(get_career_service),
    _: User = Depends(get_current_user),
    _role: str = Depends(require_roles("hr")),
):
    return await service.list_all_applications(job_opening_id=job_opening_id, status=application_status, offset=skip, limit=limit)


@router.get("/interviews", response_model=list[InterviewRead], summary="List all interviews across every candidate")
async def list_all_interviews(skip: int = 0, limit: int = 200, service: InterviewService = Depends(get_interview_service),
                               _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.list_all(offset=skip, limit=limit)


@router.get("/offers", response_model=list[OfferRead], summary="List all offers across every candidate")
async def list_all_offers(skip: int = 0, limit: int = 200, service: OfferService = Depends(get_offer_service),
                           _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.list_all(offset=skip, limit=limit)


@router.get("/{id}", response_model=JobOpeningRead)
async def get_opening(id: uuid.UUID, service: JobOpeningService = Depends(get_career_service)):
    return await service.get(id)


@router.post("", response_model=JobOpeningRead, status_code=status.HTTP_201_CREATED)
async def create_opening(data: JobOpeningCreate, db: AsyncSession = Depends(get_db), service: JobOpeningService = Depends(get_career_service),
                          _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    opening = await service.create(data); await db.commit()
    return opening


@router.put("/{id}", response_model=JobOpeningRead)
async def update_opening(id: uuid.UUID, data: JobOpeningUpdate, db: AsyncSession = Depends(get_db), service: JobOpeningService = Depends(get_career_service),
                          _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    opening = await service.update(id, data); await db.commit()
    return opening


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_opening(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: JobOpeningService = Depends(get_career_service),
                          _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    await service.delete(id); await db.commit()


@router.get("/{id}/applications", response_model=list[JobApplicationRead])
async def list_applications(id: uuid.UUID, service: JobOpeningService = Depends(get_career_service),
                             _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.list_applications(id)


@router.post("/{id}/applications", response_model=JobApplicationRead, status_code=status.HTTP_201_CREATED,
             summary="Submit an application (public — candidates have no account)")
async def create_application(id: uuid.UUID, data: JobApplicationCreate, db: AsyncSession = Depends(get_db),
                              service: JobOpeningService = Depends(get_career_service)):
    data.job_opening_id = id
    application = await service.create_application(data); await db.commit()
    return application


@router.get("/applications/{app_id}", response_model=JobApplicationRead)
async def get_application(app_id: uuid.UUID, service: JobOpeningService = Depends(get_career_service),
                           _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.get_application(app_id)


@router.put("/applications/{app_id}", response_model=JobApplicationRead)
async def update_application(app_id: uuid.UUID, data: JobApplicationUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                              service: JobOpeningService = Depends(get_career_service), _role: str = Depends(require_roles("hr"))):
    application = await service.update_application(app_id, data, actor_id=current_user.id); await db.commit()
    return application


# ── Interviews ──

@router.get("/applications/{app_id}/interviews", response_model=list[InterviewRead])
async def list_interviews(app_id: uuid.UUID, service: InterviewService = Depends(get_interview_service),
                           _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.list_for_application(app_id)


@router.post("/applications/{app_id}/interviews", response_model=InterviewRead, status_code=status.HTTP_201_CREATED)
async def schedule_interview(app_id: uuid.UUID, data: InterviewCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                              service: InterviewService = Depends(get_interview_service), _role: str = Depends(require_roles("hr"))):
    interview = await service.schedule(app_id, data, created_by=current_user.id); await db.commit()
    return interview


@router.put("/interviews/{id}", response_model=InterviewRead)
async def update_interview(id: uuid.UUID, data: InterviewUpdate, db: AsyncSession = Depends(get_db), service: InterviewService = Depends(get_interview_service),
                            _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    interview = await service.update(id, data); await db.commit()
    return interview


@router.post("/interviews/{id}/complete", response_model=InterviewRead)
async def complete_interview(id: uuid.UUID, data: InterviewCompleteRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                              service: InterviewService = Depends(get_interview_service), _role: str = Depends(require_roles("hr"))):
    interview = await service.complete(id, data, actor_id=current_user.id); await db.commit()
    return interview


# ── Offers ──

@router.get("/applications/{app_id}/offers", response_model=list[OfferRead])
async def list_offers(app_id: uuid.UUID, service: OfferService = Depends(get_offer_service),
                       _: User = Depends(get_current_user), _role: str = Depends(require_roles("hr"))):
    return await service.list_for_application(app_id)


@router.post("/applications/{app_id}/offers", response_model=OfferRead, status_code=status.HTTP_201_CREATED)
async def generate_offer(app_id: uuid.UUID, data: OfferCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                          service: OfferService = Depends(get_offer_service), _role: str = Depends(require_roles("hr"))):
    offer = await service.generate(app_id, data, created_by=current_user.id); await db.commit()
    return offer


@router.put("/offers/{id}", response_model=OfferRead)
async def update_offer(id: uuid.UUID, data: OfferUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                        service: OfferService = Depends(get_offer_service), _role: str = Depends(require_roles("hr"))):
    if data.status and data.status in ("sent", "declined"):
        offer = await service.update_status(id, data.status, actor_id=current_user.id)
    else:
        offer = await service.update(id, data)
    await db.commit()
    return offer


@router.post("/offers/{id}/accept", response_model=OfferRead, summary="Accept offer -> hire workflow (creates employee account)")
async def accept_offer(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                        service: OfferService = Depends(get_offer_service), _role: str = Depends(require_roles("hr"))):
    offer, _new_user_id = await service.accept_and_hire(id, actor_id=current_user.id)
    await db.commit()
    return offer


@router.post("/offers/{id}/decline", response_model=OfferRead)
async def decline_offer(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
                         service: OfferService = Depends(get_offer_service), _role: str = Depends(require_roles("hr"))):
    offer = await service.update_status(id, "declined", actor_id=current_user.id); await db.commit()
    return offer
