"""Routes for the Case Studies module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.case_studies.dependencies import get_case_study_service
from app.modules.case_studies.schemas import CaseStudyCreate, CaseStudyRead, CaseStudyUpdate
from app.modules.case_studies.service import CaseStudyService

router = APIRouter(prefix="/case-studies", tags=["Case Studies"])


@router.get("", response_model=list[CaseStudyRead])
async def list_case_studies(skip: int = 0, limit: int = 100, service: CaseStudyService = Depends(get_case_study_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=CaseStudyRead)
async def get_case_study(id: uuid.UUID, service: CaseStudyService = Depends(get_case_study_service)):
    return await service.get(id)


@router.post("", response_model=CaseStudyRead, status_code=status.HTTP_201_CREATED)
async def create_case_study(data: CaseStudyCreate, service: CaseStudyService = Depends(get_case_study_service)):
    return await service.create(data)


@router.put("/{id}", response_model=CaseStudyRead)
async def update_case_study(id: uuid.UUID, data: CaseStudyUpdate, service: CaseStudyService = Depends(get_case_study_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case_study(id: uuid.UUID, service: CaseStudyService = Depends(get_case_study_service)):
    await service.delete(id)
