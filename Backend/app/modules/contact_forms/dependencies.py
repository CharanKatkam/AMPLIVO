"""Dependencies for the Contact Forms module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.contact_forms.service import ContactSubmissionService


def get_contact_submission_service(db: AsyncSession = Depends(get_db)) -> ContactSubmissionService:
    return ContactSubmissionService(db)
