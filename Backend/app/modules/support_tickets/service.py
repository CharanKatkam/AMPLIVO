"""Service layer for Support Tickets."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.support_tickets.models import SupportTicket, SupportTicketComment
from app.modules.support_tickets.repository import SupportTicketCommentRepository, SupportTicketRepository


class SupportTicketService:
    def __init__(self, repo: SupportTicketRepository) -> None:
        self._repo = repo

    async def list_tickets(self, *, search=None, client_id=None, status=None, priority=None,
                           category=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(
            search=search, client_id=client_id, status=status, priority=priority,
            category=category, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit,
        )
        total = await self._repo.count_filtered(search=search, client_id=client_id, status=status, priority=priority, category=category)
        return items, total

    async def get_ticket(self, ticket_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> SupportTicket:
        t = await self._repo.get_by_id(ticket_id)
        if t is None: raise NotFoundException("SupportTicket")
        enforce_client_scope(t.client_id, scoped_client_id)
        return t

    async def create_ticket(self, data: dict, *, created_by: uuid.UUID | None = None) -> SupportTicket:
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)

    async def update_ticket(self, ticket_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> SupportTicket:
        await self.get_ticket(ticket_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(ticket_id, data)
        if updated is None: raise NotFoundException("SupportTicket")
        return updated

    async def delete_ticket(self, ticket_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_ticket(ticket_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(ticket_id): raise NotFoundException("SupportTicket")


class SupportTicketCommentService:
    def __init__(self, repo: SupportTicketCommentRepository) -> None:
        self._repo = repo

    async def list_comments(self, ticket_id: uuid.UUID) -> Sequence[SupportTicketComment]:
        return await self._repo.list_by_ticket(ticket_id)

    async def create_comment(self, ticket_id: uuid.UUID, data: dict, *, user_id: uuid.UUID | None = None) -> SupportTicketComment:
        data["ticket_id"] = ticket_id
        data["user_id"] = user_id
        return await self._repo.create_from_dict(data)
