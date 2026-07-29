"""Dependencies for the Case Studies module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.case_studies.service import CaseStudyService


def get_case_study_service(db: AsyncSession = Depends(get_db)) -> CaseStudyService:
    return CaseStudyService(db)
