"""Routes for the Companies module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.modules.companies.dependencies import get_company_service
from app.modules.companies.schemas import CompanyCreate, CompanyRead, CompanyUpdate
from app.modules.companies.service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=list[CompanyRead])
async def list_companies(skip: int = 0, limit: int = 100, service: CompanyService = Depends(get_company_service), _: User = Depends(get_current_user)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=CompanyRead)
async def get_company(id: uuid.UUID, service: CompanyService = Depends(get_company_service), _: User = Depends(get_current_user)):
    return await service.get(id)


@router.post("", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
async def create_company(data: CompanyCreate, db: AsyncSession = Depends(get_db), service: CompanyService = Depends(get_company_service), _: User = Depends(get_current_user)):
    company = await service.create(data)
    await db.commit()
    return company


@router.put("/{id}", response_model=CompanyRead)
async def update_company(id: uuid.UUID, data: CompanyUpdate, db: AsyncSession = Depends(get_db), service: CompanyService = Depends(get_company_service), _: User = Depends(get_current_user)):
    company = await service.update(id, data)
    await db.commit()
    return company


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: CompanyService = Depends(get_company_service), _: User = Depends(get_current_user)):
    await service.delete(id)
    await db.commit()
