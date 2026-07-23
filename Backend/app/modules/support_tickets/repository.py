"""Repository layer for Support Tickets."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from app.core.filters import apply_search, apply_sorting
from app.modules.support_tickets.models import SupportTicket, SupportTicketComment
from app.repositories.base import BaseRepository


class SupportTicketRepository(BaseRepository[SupportTicket]):
    model = SupportTicket
    searchable_columns = [SupportTicket.subject, SupportTicket.description]

    async def get_all_filtered(self, *, search=None, client_id=None, status=None, priority=None,
                               category=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[SupportTicket]:
        stmt = select(SupportTicket)
        if client_id: stmt = stmt.where(SupportTicket.client_id == client_id)
        if status: stmt = stmt.where(SupportTicket.status == status)
        if priority: stmt = stmt.where(SupportTicket.priority == priority)
        if category: stmt = stmt.where(SupportTicket.category == category)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=SupportTicket, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()

    async def count_filtered(self, *, search=None, client_id=None, status=None, priority=None, category=None) -> int:
        stmt = select(func.count()).select_from(SupportTicket)
        if client_id: stmt = stmt.where(SupportTicket.client_id == client_id)
        if status: stmt = stmt.where(SupportTicket.status == status)
        if priority: stmt = stmt.where(SupportTicket.priority == priority)
        if category: stmt = stmt.where(SupportTicket.category == category)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()


class SupportTicketCommentRepository(BaseRepository[SupportTicketComment]):
    model = SupportTicketComment

    async def list_by_ticket(self, ticket_id: uuid.UUID) -> Sequence[SupportTicketComment]:
        r = await self._db.execute(
            select(SupportTicketComment).where(SupportTicketComment.ticket_id == ticket_id).order_by(SupportTicketComment.created_at)
        )
        return r.scalars().all()
