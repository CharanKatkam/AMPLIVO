"""Dependencies for the Testimonials module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.testimonials.service import TestimonialService


def get_testimonial_service(db: AsyncSession = Depends(get_db)) -> TestimonialService:
    return TestimonialService(db)
