"""Routes for the Contact Forms module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.rbac import require_roles
from app.models.user import User
from app.modules.contact_forms.dependencies import get_contact_submission_service
from app.modules.contact_forms.schemas import ContactSubmissionCreate, ContactSubmissionRead, ContactSubmissionUpdate
from app.modules.contact_forms.service import ContactSubmissionService

router = APIRouter(prefix="/contact-submissions", tags=["Contact Forms"])


# POST stays public (the site's own contact form) - everything else exposes
# submitted leads' PII and is CRM/Sales-internal.
@router.get("", response_model=list[ContactSubmissionRead])
async def list_submissions(skip: int = 0, limit: int = 100, service: ContactSubmissionService = Depends(get_contact_submission_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("crm", "sales"))):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=ContactSubmissionRead)
async def get_submission(id: uuid.UUID, service: ContactSubmissionService = Depends(get_contact_submission_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("crm", "sales"))):
    return await service.get(id)


@router.post("", response_model=ContactSubmissionRead, status_code=status.HTTP_201_CREATED)
async def create_submission(data: ContactSubmissionCreate, db: AsyncSession = Depends(get_db), service: ContactSubmissionService = Depends(get_contact_submission_service)):
    submission = await service.create(data)
    await db.commit()
    return submission


@router.put("/{id}", response_model=ContactSubmissionRead)
async def update_submission(id: uuid.UUID, data: ContactSubmissionUpdate, db: AsyncSession = Depends(get_db), service: ContactSubmissionService = Depends(get_contact_submission_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("crm", "sales"))):
    submission = await service.update(id, data)
    await db.commit()
    return submission


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(id: uuid.UUID, db: AsyncSession = Depends(get_db), service: ContactSubmissionService = Depends(get_contact_submission_service), _: User = Depends(get_current_user), _role: str = Depends(require_roles("crm", "sales"))):
    await service.delete(id)
    await db.commit()
