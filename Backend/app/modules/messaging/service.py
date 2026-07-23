"""Service layer for Messaging."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import BadRequestException, NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.messaging.models import Conversation, Message
from app.modules.messaging.repository import ConversationRepository, MessageRepository


class ConversationService:
    def __init__(self, repo: ConversationRepository) -> None:
        self._repo = repo

    async def list_conversations(self, *, client_id=None, offset=0, limit=20):
        items = await self._repo.get_all_filtered(client_id=client_id, offset=offset, limit=limit)
        total = await self._repo.count_filtered(client_id=client_id)
        return items, total

    async def get_conversation(self, conversation_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Conversation:
        c = await self._repo.get_by_id(conversation_id)
        if c is None: raise NotFoundException("Conversation")
        enforce_client_scope(c.client_id, scoped_client_id)
        return c

    async def get_or_create_for_client(self, client_id: uuid.UUID, *, subject: str = "General") -> Conversation:
        existing = await self._repo.get_by_client(client_id)
        if existing is not None:
            return existing
        return await self._repo.create_from_dict({"client_id": client_id, "subject": subject})

    async def create_conversation(self, data: dict) -> Conversation:
        if not data.get("client_id"):
            raise BadRequestException("client_id is required to start a conversation.")
        return await self.get_or_create_for_client(data["client_id"], subject=data.get("subject") or "General")


class MessageService:
    def __init__(self, repo: MessageRepository) -> None:
        self._repo = repo

    async def list_messages(self, conversation_id: uuid.UUID, *, offset=0, limit=200) -> Sequence[Message]:
        return await self._repo.list_by_conversation(conversation_id, offset=offset, limit=limit)

    async def send_message(self, conversation_id: uuid.UUID, data: dict, *, sender_id: uuid.UUID | None) -> Message:
        data["conversation_id"] = conversation_id
        data["sender_id"] = sender_id
        return await self._repo.create_from_dict(data)

    async def mark_conversation_read(self, conversation_id: uuid.UUID, *, current_user_id: uuid.UUID | None) -> int:
        return await self._repo.mark_all_read(conversation_id, exclude_sender_id=current_user_id)

    async def count_unread(self, conversation_id: uuid.UUID, *, current_user_id: uuid.UUID | None) -> int:
        return await self._repo.count_unread(conversation_id, exclude_sender_id=current_user_id)
