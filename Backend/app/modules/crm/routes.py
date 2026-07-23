"""API routes for the CRM module."""
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
from app.modules.crm.dependencies import (
    get_client_address_service, get_client_contact_service,
    get_client_document_service, get_client_note_service, get_client_service,
)
from app.modules.crm.schemas import *
from app.modules.crm.service import (
    ClientAddressService, ClientContactService, ClientDocumentService,
    ClientNoteService, ClientService,
)

router = APIRouter(prefix="/clients", tags=["CRM — Clients"])

# ── Clients ─────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[ClientRead], summary="List clients")
async def list_clients(
    params: PaginationParams = Depends(),
    client_status: str | None = Query(None, alias="status"),
    client_type: str | None = Query(None),
    assigned_to: uuid.UUID | None = Query(None),
    branch_id: uuid.UUID | None = Query(None),
    is_active: bool | None = Query(None),
    svc: ClientService = Depends(get_client_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_clients(
        search=params.search, status=client_status, client_type=client_type,
        assigned_to=assigned_to, branch_id=branch_id, is_active=is_active,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[ClientRead].create(
        items=[ClientRead.model_validate(c) for c in items],
        total=total, page=params.page, page_size=params.page_size,
    )

@router.post("", response_model=ClientRead, status_code=status.HTTP_201_CREATED, summary="Create client")
async def create_client(
    payload: ClientCreate, db: AsyncSession = Depends(get_db),
    svc: ClientService = Depends(get_client_service),
    current_user: User = Depends(get_current_user),
):
    client = await svc.create_client(payload.model_dump(), created_by=current_user.id)
    await db.commit()
    return ClientRead.model_validate(client)

@router.get("/me", response_model=ClientRead, summary="Get my own company (client-portal user)")
async def get_my_client(svc: ClientService = Depends(get_client_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    if scoped_client_id is None:
        raise BadRequestException("This account is not a client-portal user.")
    return ClientRead.model_validate(await svc.get_client(scoped_client_id))

@router.get("/{client_id}", response_model=ClientRead, summary="Get client")
async def get_client(client_id: uuid.UUID, svc: ClientService = Depends(get_client_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return ClientRead.model_validate(await svc.get_client(client_id, scoped_client_id=scoped_client_id))

@router.put("/{client_id}", response_model=ClientRead, summary="Update client")
async def update_client(client_id: uuid.UUID, payload: ClientUpdate, db: AsyncSession = Depends(get_db),
                        svc: ClientService = Depends(get_client_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    client = await svc.update_client(client_id, payload.model_dump(exclude_unset=True), scoped_client_id=scoped_client_id)
    await db.commit()
    return ClientRead.model_validate(client)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete client")
async def delete_client(client_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                        svc: ClientService = Depends(get_client_service), _: User = Depends(get_current_user)):
    await svc.delete_client(client_id); await db.commit()

# ── Client Contacts ────────────────────────────────────────────────────

@router.get("/{client_id}/contacts", response_model=list[ClientContactRead], summary="List client contacts")
async def list_contacts(client_id: uuid.UUID, svc: ClientContactService = Depends(get_client_contact_service), _: User = Depends(get_current_user)):
    return [ClientContactRead.model_validate(c) for c in await svc.list_contacts(client_id)]

@router.post("/{client_id}/contacts", response_model=ClientContactRead, status_code=status.HTTP_201_CREATED, summary="Add contact")
async def create_contact(client_id: uuid.UUID, payload: ClientContactCreate, db: AsyncSession = Depends(get_db),
                         svc: ClientContactService = Depends(get_client_contact_service), _: User = Depends(get_current_user)):
    c = await svc.create_contact(client_id, payload.model_dump()); await db.commit()
    return ClientContactRead.model_validate(c)

@router.put("/contacts/{contact_id}", response_model=ClientContactRead, summary="Update contact")
async def update_contact(contact_id: uuid.UUID, payload: ClientContactUpdate, db: AsyncSession = Depends(get_db),
                         svc: ClientContactService = Depends(get_client_contact_service), _: User = Depends(get_current_user)):
    c = await svc.update_contact(contact_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return ClientContactRead.model_validate(c)

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete contact")
async def delete_contact(contact_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                         svc: ClientContactService = Depends(get_client_contact_service), _: User = Depends(get_current_user)):
    await svc.delete_contact(contact_id); await db.commit()

# ── Client Addresses ───────────────────────────────────────────────────

@router.get("/{client_id}/addresses", response_model=list[ClientAddressRead], summary="List client addresses")
async def list_addresses(client_id: uuid.UUID, svc: ClientAddressService = Depends(get_client_address_service), _: User = Depends(get_current_user)):
    return [ClientAddressRead.model_validate(a) for a in await svc.list_addresses(client_id)]

@router.post("/{client_id}/addresses", response_model=ClientAddressRead, status_code=status.HTTP_201_CREATED, summary="Add address")
async def create_address(client_id: uuid.UUID, payload: ClientAddressCreate, db: AsyncSession = Depends(get_db),
                         svc: ClientAddressService = Depends(get_client_address_service), _: User = Depends(get_current_user)):
    a = await svc.create_address(client_id, payload.model_dump()); await db.commit()
    return ClientAddressRead.model_validate(a)

@router.put("/addresses/{address_id}", response_model=ClientAddressRead, summary="Update address")
async def update_address(address_id: uuid.UUID, payload: ClientAddressUpdate, db: AsyncSession = Depends(get_db),
                         svc: ClientAddressService = Depends(get_client_address_service), _: User = Depends(get_current_user)):
    a = await svc.update_address(address_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return ClientAddressRead.model_validate(a)

@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete address")
async def delete_address(address_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                         svc: ClientAddressService = Depends(get_client_address_service), _: User = Depends(get_current_user)):
    await svc.delete_address(address_id); await db.commit()

# ── Client Documents ───────────────────────────────────────────────────

@router.get("/{client_id}/documents", response_model=list[ClientDocumentRead], summary="List client documents")
async def list_documents(client_id: uuid.UUID, svc: ClientDocumentService = Depends(get_client_document_service), _: User = Depends(get_current_user)):
    return [ClientDocumentRead.model_validate(d) for d in await svc.list_documents(client_id)]

@router.post("/{client_id}/documents", response_model=ClientDocumentRead, status_code=status.HTTP_201_CREATED, summary="Upload document")
async def create_document(client_id: uuid.UUID, payload: ClientDocumentCreate, db: AsyncSession = Depends(get_db),
                          svc: ClientDocumentService = Depends(get_client_document_service), current_user: User = Depends(get_current_user)):
    d = await svc.create_document(client_id, payload.model_dump(), uploaded_by=current_user.id); await db.commit()
    return ClientDocumentRead.model_validate(d)

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete document")
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                          svc: ClientDocumentService = Depends(get_client_document_service), _: User = Depends(get_current_user)):
    await svc.delete_document(document_id); await db.commit()

# ── Client Notes ───────────────────────────────────────────────────────

@router.get("/{client_id}/notes", response_model=list[ClientNoteRead], summary="List client notes")
async def list_notes(client_id: uuid.UUID, svc: ClientNoteService = Depends(get_client_note_service), _: User = Depends(get_current_user)):
    return [ClientNoteRead.model_validate(n) for n in await svc.list_notes(client_id)]

@router.post("/{client_id}/notes", response_model=ClientNoteRead, status_code=status.HTTP_201_CREATED, summary="Add note")
async def create_note(client_id: uuid.UUID, payload: ClientNoteCreate, db: AsyncSession = Depends(get_db),
                      svc: ClientNoteService = Depends(get_client_note_service), current_user: User = Depends(get_current_user)):
    n = await svc.create_note(client_id, payload.model_dump(), created_by=current_user.id); await db.commit()
    return ClientNoteRead.model_validate(n)

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete note")
async def delete_note(note_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                      svc: ClientNoteService = Depends(get_client_note_service), _: User = Depends(get_current_user)):
    await svc.delete_note(note_id); await db.commit()
