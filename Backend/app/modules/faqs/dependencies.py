"""Dependencies for the FAQs module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.faqs.service import FaqService


def get_faq_service(db: AsyncSession = Depends(get_db)) -> FaqService:
    return FaqService(db)
