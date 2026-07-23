"""Routes for the Portfolio module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.portfolio.dependencies import get_portfolio_service
from app.modules.portfolio.schemas import PortfolioItemCreate, PortfolioItemRead, PortfolioItemUpdate
from app.modules.portfolio.service import PortfolioItemService

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("", response_model=list[PortfolioItemRead])
async def list_portfolio(skip: int = 0, limit: int = 100, service: PortfolioItemService = Depends(get_portfolio_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=PortfolioItemRead)
async def get_portfolio_item(id: uuid.UUID, service: PortfolioItemService = Depends(get_portfolio_service)):
    return await service.get(id)


@router.post("", response_model=PortfolioItemRead, status_code=status.HTTP_201_CREATED)
async def create_portfolio_item(data: PortfolioItemCreate, service: PortfolioItemService = Depends(get_portfolio_service)):
    return await service.create(data)


@router.put("/{id}", response_model=PortfolioItemRead)
async def update_portfolio_item(id: uuid.UUID, data: PortfolioItemUpdate, service: PortfolioItemService = Depends(get_portfolio_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_item(id: uuid.UUID, service: PortfolioItemService = Depends(get_portfolio_service)):
    await service.delete(id)
