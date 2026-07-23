"""DI factories for Support Tickets."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.support_tickets.repository import *
from app.modules.support_tickets.service import *


def get_support_ticket_service(db: AsyncSession = Depends(get_db)) -> SupportTicketService:
    return SupportTicketService(SupportTicketRepository(db))


def get_support_ticket_comment_service(db: AsyncSession = Depends(get_db)) -> SupportTicketCommentService:
    return SupportTicketCommentService(SupportTicketCommentRepository(db))
