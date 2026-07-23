"""Repository for the Contact Forms module."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.contact_forms.models import ContactSubmission


class ContactSubmissionRepository(BaseRepository[ContactSubmission]):
    model = ContactSubmission

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
