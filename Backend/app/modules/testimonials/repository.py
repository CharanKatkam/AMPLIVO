"""Repository for the Testimonials module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.testimonials.models import Testimonial


class TestimonialRepository(BaseRepository[Testimonial]):
    model = Testimonial

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
