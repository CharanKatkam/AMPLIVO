"""Service layer for the CRM module."""
from __future__ import annotations
import uuid
from typing import Any, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.crm.models import Client, ClientAddress, ClientContact, ClientDocument, ClientNote
from app.modules.crm.repository import (
    ClientAddressRepository, ClientContactRepository, ClientDocumentRepository,
    ClientNoteRepository, ClientRepository,
)


class ClientService:
    def __init__(self, db: AsyncSession, repo: ClientRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_clients(self, *, search=None, status=None, client_type=None,
                           assigned_to=None, branch_id=None, is_active=None,
                           sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(
            search=search, status=status, client_type=client_type,
            assigned_to=assigned_to, branch_id=branch_id, is_active=is_active,
            sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit,
        )
        total = await self._repo.count_filtered(
            search=search, status=status, client_type=client_type,
            assigned_to=assigned_to, branch_id=branch_id, is_active=is_active,
        )
        return items, total

    async def get_client(self, client_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Client:
        client = await self._repo.get_detail(client_id)
        if client is None:
            raise NotFoundException("Client")
        enforce_client_scope(client.id, scoped_client_id)
        return client

    async def create_client(self, data: dict[str, Any], created_by: uuid.UUID | None = None) -> Client:
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)

    async def update_client(self, client_id: uuid.UUID, data: dict[str, Any], *, scoped_client_id: uuid.UUID | None = None) -> Client:
        await self.get_client(client_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(client_id, data)
        if updated is None:
            raise NotFoundException("Client")
        return updated

    async def delete_client(self, client_id: uuid.UUID) -> None:
        if not await self._repo.delete(client_id):
            raise NotFoundException("Client")


class ClientContactService:
    def __init__(self, db: AsyncSession, repo: ClientContactRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_contacts(self, client_id: uuid.UUID) -> Sequence[ClientContact]:
        return await self._repo.list_by_client(client_id)

    async def get_contact(self, contact_id: uuid.UUID) -> ClientContact:
        c = await self._repo.get_by_id(contact_id)
        if c is None: raise NotFoundException("ClientContact")
        return c

    async def create_contact(self, client_id: uuid.UUID, data: dict) -> ClientContact:
        data["client_id"] = client_id
        return await self._repo.create_from_dict(data)

    async def update_contact(self, contact_id: uuid.UUID, data: dict) -> ClientContact:
        updated = await self._repo.update(contact_id, data)
        if updated is None: raise NotFoundException("ClientContact")
        return updated

    async def delete_contact(self, contact_id: uuid.UUID) -> None:
        if not await self._repo.delete(contact_id): raise NotFoundException("ClientContact")


class ClientAddressService:
    def __init__(self, db: AsyncSession, repo: ClientAddressRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_addresses(self, client_id: uuid.UUID) -> Sequence[ClientAddress]:
        return await self._repo.list_by_client(client_id)

    async def create_address(self, client_id: uuid.UUID, data: dict) -> ClientAddress:
        data["client_id"] = client_id
        return await self._repo.create_from_dict(data)

    async def update_address(self, address_id: uuid.UUID, data: dict) -> ClientAddress:
        updated = await self._repo.update(address_id, data)
        if updated is None: raise NotFoundException("ClientAddress")
        return updated

    async def delete_address(self, address_id: uuid.UUID) -> None:
        if not await self._repo.delete(address_id): raise NotFoundException("ClientAddress")


class ClientDocumentService:
    def __init__(self, db: AsyncSession, repo: ClientDocumentRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_documents(self, client_id: uuid.UUID) -> Sequence[ClientDocument]:
        return await self._repo.list_by_client(client_id)

    async def create_document(self, client_id: uuid.UUID, data: dict, uploaded_by: uuid.UUID | None = None) -> ClientDocument:
        data["client_id"] = client_id
        data["uploaded_by"] = uploaded_by
        return await self._repo.create_from_dict(data)

    async def delete_document(self, doc_id: uuid.UUID) -> None:
        if not await self._repo.delete(doc_id): raise NotFoundException("ClientDocument")


class ClientNoteService:
    def __init__(self, db: AsyncSession, repo: ClientNoteRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_notes(self, client_id: uuid.UUID) -> Sequence[ClientNote]:
        return await self._repo.list_by_client(client_id)

    async def create_note(self, client_id: uuid.UUID, data: dict, created_by: uuid.UUID | None = None) -> ClientNote:
        data["client_id"] = client_id
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)

    async def delete_note(self, note_id: uuid.UUID) -> None:
        if not await self._repo.delete(note_id): raise NotFoundException("ClientNote")
