"""API routes for client-portal Messaging."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import BadRequestException
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.messaging.dependencies import get_conversation_service, get_message_service
from app.modules.messaging.schemas import *
from app.modules.messaging.service import ConversationService, MessageService

router = APIRouter(prefix="/messaging", tags=["Messaging"])


@router.get("/conversations", response_model=PaginatedResponse[ConversationRead], summary="List conversations")
async def list_conversations(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    svc: ConversationService = Depends(get_conversation_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    items, total = await svc.list_conversations(client_id=effective_client_id, offset=params.offset, limit=params.page_size)
    return PaginatedResponse[ConversationRead].create(items=[ConversationRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)


@router.post("/conversations", response_model=ConversationRead, status_code=status.HTTP_201_CREATED, summary="Start (or resume) a conversation")
async def create_conversation(payload: ConversationCreate, db: AsyncSession = Depends(get_db), svc: ConversationService = Depends(get_conversation_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    data = payload.model_dump()
    if scoped_client_id is not None:
        data["client_id"] = scoped_client_id
    elif not data.get("client_id"):
        raise BadRequestException("client_id is required to start a conversation.")
    c = await svc.create_conversation(data)
    await db.commit()
    return ConversationRead.model_validate(c)


@router.get("/conversations/{conversation_id}", response_model=ConversationRead, summary="Get conversation")
async def get_conversation(conversation_id: uuid.UUID, svc: ConversationService = Depends(get_conversation_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return ConversationRead.model_validate(await svc.get_conversation(conversation_id, scoped_client_id=scoped_client_id))


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageRead], summary="List messages in conversation")
async def list_messages(conversation_id: uuid.UUID, svc: MessageService = Depends(get_message_service), conv_svc: ConversationService = Depends(get_conversation_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await conv_svc.get_conversation(conversation_id, scoped_client_id=scoped_client_id)
    return [MessageRead.model_validate(x) for x in await svc.list_messages(conversation_id)]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED, summary="Send message")
async def send_message(conversation_id: uuid.UUID, payload: MessageCreate, db: AsyncSession = Depends(get_db), svc: MessageService = Depends(get_message_service), conv_svc: ConversationService = Depends(get_conversation_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await conv_svc.get_conversation(conversation_id, scoped_client_id=scoped_client_id)
    m = await svc.send_message(conversation_id, payload.model_dump(), sender_id=current_user.id)
    await db.commit()
    return MessageRead.model_validate(m)


@router.put("/conversations/{conversation_id}/read", status_code=status.HTTP_200_OK, summary="Mark conversation messages as read")
async def mark_conversation_read(conversation_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: MessageService = Depends(get_message_service), conv_svc: ConversationService = Depends(get_conversation_service), current_user: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await conv_svc.get_conversation(conversation_id, scoped_client_id=scoped_client_id)
    count = await svc.mark_conversation_read(conversation_id, current_user_id=current_user.id)
    await db.commit()
    return {"message": f"{count} messages marked as read"}
