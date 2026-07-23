"""API routes for Support Tickets (also covers client-facing 'Contact Requests')."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.support_tickets.dependencies import get_support_ticket_comment_service, get_support_ticket_service
from app.modules.support_tickets.schemas import *
from app.modules.support_tickets.service import SupportTicketCommentService, SupportTicketService

router = APIRouter(prefix="/support-tickets", tags=["Support Tickets"])


@router.get("", response_model=PaginatedResponse[SupportTicketRead], summary="List support tickets")
async def list_support_tickets(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    ticket_status: str | None = Query(None, alias="status"),
    priority: str | None = Query(None),
    category: str | None = Query(None),
    svc: SupportTicketService = Depends(get_support_ticket_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    items, total = await svc.list_tickets(
        search=params.search, client_id=effective_client_id, status=ticket_status, priority=priority,
        category=category, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[SupportTicketRead].create(items=[SupportTicketRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)


@router.post("", response_model=SupportTicketRead, status_code=status.HTTP_201_CREATED, summary="Create support ticket")
async def create_support_ticket(payload: SupportTicketCreate, db: AsyncSession = Depends(get_db), svc: SupportTicketService = Depends(get_support_ticket_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    data = payload.model_dump()
    if scoped_client_id is not None:
        data["client_id"] = scoped_client_id
    t = await svc.create_ticket(data, created_by=current_user.id)
    await db.commit()
    return SupportTicketRead.model_validate(t)


@router.get("/{ticket_id}", response_model=SupportTicketRead, summary="Get support ticket")
async def get_support_ticket(ticket_id: uuid.UUID, svc: SupportTicketService = Depends(get_support_ticket_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return SupportTicketRead.model_validate(await svc.get_ticket(ticket_id, scoped_client_id=scoped_client_id))


@router.put("/{ticket_id}", response_model=SupportTicketRead, summary="Update support ticket")
async def update_support_ticket(ticket_id: uuid.UUID, payload: SupportTicketUpdate, db: AsyncSession = Depends(get_db), svc: SupportTicketService = Depends(get_support_ticket_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    t = await svc.update_ticket(ticket_id, payload.model_dump(exclude_unset=True), scoped_client_id=scoped_client_id)
    await db.commit()
    return SupportTicketRead.model_validate(t)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete support ticket")
async def delete_support_ticket(ticket_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: SupportTicketService = Depends(get_support_ticket_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await svc.delete_ticket(ticket_id, scoped_client_id=scoped_client_id)
    await db.commit()


# ── Comments / replies ──
@router.get("/{ticket_id}/comments", response_model=list[SupportTicketCommentRead], summary="List ticket comments")
async def list_ticket_comments(ticket_id: uuid.UUID, svc: SupportTicketCommentService = Depends(get_support_ticket_comment_service), ticket_svc: SupportTicketService = Depends(get_support_ticket_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await ticket_svc.get_ticket(ticket_id, scoped_client_id=scoped_client_id)
    return [SupportTicketCommentRead.model_validate(x) for x in await svc.list_comments(ticket_id)]


@router.post("/{ticket_id}/comments", response_model=SupportTicketCommentRead, status_code=status.HTTP_201_CREATED, summary="Reply to ticket")
async def create_ticket_comment(ticket_id: uuid.UUID, payload: SupportTicketCommentCreate, db: AsyncSession = Depends(get_db), svc: SupportTicketCommentService = Depends(get_support_ticket_comment_service), ticket_svc: SupportTicketService = Depends(get_support_ticket_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await ticket_svc.get_ticket(ticket_id, scoped_client_id=scoped_client_id)
    c = await svc.create_comment(ticket_id, payload.model_dump(), user_id=current_user.id)
    await db.commit()
    return SupportTicketCommentRead.model_validate(c)
