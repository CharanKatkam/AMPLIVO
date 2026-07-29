"""DI factories for Messaging."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.messaging.repository import *
from app.modules.messaging.service import *


def get_conversation_service(db: AsyncSession = Depends(get_db)) -> ConversationService:
    return ConversationService(ConversationRepository(db))


def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    return MessageService(MessageRepository(db))
