"""Dependencies for the Companies module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.companies.service import CompanyService


def get_company_service(db: AsyncSession = Depends(get_db)) -> CompanyService:
    return CompanyService(db)
