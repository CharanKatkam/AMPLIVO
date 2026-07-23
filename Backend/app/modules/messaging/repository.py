"""Repository layer for Messaging."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from app.modules.messaging.models import Conversation, Message
from app.repositories.base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    model = Conversation

    async def get_all_filtered(self, *, client_id=None, offset=0, limit=20) -> Sequence[Conversation]:
        stmt = select(Conversation)
        if client_id: stmt = stmt.where(Conversation.client_id == client_id)
        stmt = stmt.order_by(Conversation.updated_at.desc()).offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()

    async def count_filtered(self, *, client_id=None) -> int:
        stmt = select(func.count()).select_from(Conversation)
        if client_id: stmt = stmt.where(Conversation.client_id == client_id)
        return (await self._db.execute(stmt)).scalar_one()

    async def get_by_client(self, client_id: uuid.UUID) -> Conversation | None:
        r = await self._db.execute(select(Conversation).where(Conversation.client_id == client_id).order_by(Conversation.created_at))
        return r.scalars().first()


class MessageRepository(BaseRepository[Message]):
    model = Message

    async def list_by_conversation(self, conversation_id: uuid.UUID, *, offset=0, limit=200) -> Sequence[Message]:
        r = await self._db.execute(
            select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at).offset(offset).limit(limit)
        )
        return r.scalars().all()

    async def mark_all_read(self, conversation_id: uuid.UUID, *, exclude_sender_id: uuid.UUID | None) -> int:
        stmt = select(Message).where(Message.conversation_id == conversation_id, Message.is_read == False)
        if exclude_sender_id is not None:
            stmt = stmt.where(Message.sender_id != exclude_sender_id)
        items = (await self._db.execute(stmt)).scalars().all()
        for item in items:
            item.is_read = True
        return len(items)

    async def count_unread(self, conversation_id: uuid.UUID, *, exclude_sender_id: uuid.UUID | None) -> int:
        stmt = select(func.count()).select_from(Message).where(Message.conversation_id == conversation_id, Message.is_read == False)
        if exclude_sender_id is not None:
            stmt = stmt.where(Message.sender_id != exclude_sender_id)
        return (await self._db.execute(stmt)).scalar_one()
