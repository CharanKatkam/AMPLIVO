"""Routes for the Careers module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.careers.dependencies import get_career_service
from app.modules.careers.schemas import JobApplicationCreate, JobApplicationRead, JobApplicationUpdate, JobOpeningCreate, JobOpeningRead, JobOpeningUpdate
from app.modules.careers.service import JobOpeningService

router = APIRouter(prefix="/careers", tags=["Careers"])


@router.get("", response_model=list[JobOpeningRead])
async def list_openings(skip: int = 0, limit: int = 100, service: JobOpeningService = Depends(get_career_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=JobOpeningRead)
async def get_opening(id: uuid.UUID, service: JobOpeningService = Depends(get_career_service)):
    return await service.get(id)


@router.post("", response_model=JobOpeningRead, status_code=status.HTTP_201_CREATED)
async def create_opening(data: JobOpeningCreate, service: JobOpeningService = Depends(get_career_service)):
    return await service.create(data)


@router.put("/{id}", response_model=JobOpeningRead)
async def update_opening(id: uuid.UUID, data: JobOpeningUpdate, service: JobOpeningService = Depends(get_career_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_opening(id: uuid.UUID, service: JobOpeningService = Depends(get_career_service)):
    await service.delete(id)


@router.get("/{id}/applications", response_model=list[JobApplicationRead])
async def list_applications(id: uuid.UUID, service: JobOpeningService = Depends(get_career_service)):
    return await service.list_applications(id)


@router.post("/{id}/applications", response_model=JobApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(id: uuid.UUID, data: JobApplicationCreate, service: JobOpeningService = Depends(get_career_service)):
    data.job_opening_id = id
    return await service.create_application(data)


@router.get("/applications/{app_id}", response_model=JobApplicationRead)
async def get_application(app_id: uuid.UUID, service: JobOpeningService = Depends(get_career_service)):
    return await service.get_application(app_id)


@router.put("/applications/{app_id}", response_model=JobApplicationRead)
async def update_application(app_id: uuid.UUID, data: JobApplicationUpdate, service: JobOpeningService = Depends(get_career_service)):
    return await service.update_application(app_id, data)
