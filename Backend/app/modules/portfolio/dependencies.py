"""Dependencies for the Portfolio module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.portfolio.service import PortfolioItemService


def get_portfolio_service(db: AsyncSession = Depends(get_db)) -> PortfolioItemService:
    return PortfolioItemService(db)
