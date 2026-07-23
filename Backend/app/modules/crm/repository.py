"""Repository layer for the CRM module."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.crm.models import Client, ClientAddress, ClientContact, ClientDocument, ClientNote
from app.repositories.base import BaseRepository


class ClientRepository(BaseRepository[Client]):
    model = Client
    searchable_columns = [Client.company_name, Client.display_name, Client.email, Client.phone]

    async def get_detail(self, client_id: uuid.UUID) -> Client | None:
        stmt = (
            select(Client)
            .options(
                selectinload(Client.contacts),
                selectinload(Client.addresses),
            )
            .where(Client.id == client_id)
        )
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_filtered(
        self, *, search: str | None = None, status: str | None = None,
        client_type: str | None = None, assigned_to: uuid.UUID | None = None,
        branch_id: uuid.UUID | None = None, is_active: bool | None = None,
        sort_by: str | None = None, sort_order: str = "desc",
        offset: int = 0, limit: int = 20,
    ) -> Sequence[Client]:
        stmt = select(Client)
        if status: stmt = stmt.where(Client.status == status)
        if client_type: stmt = stmt.where(Client.client_type == client_type)
        if assigned_to: stmt = stmt.where(Client.assigned_to == assigned_to)
        if branch_id: stmt = stmt.where(Client.branch_id == branch_id)
        if is_active is not None: stmt = stmt.where(Client.is_active == is_active)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Client, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()

    async def count_filtered(
        self, *, search: str | None = None, status: str | None = None,
        client_type: str | None = None, assigned_to: uuid.UUID | None = None,
        branch_id: uuid.UUID | None = None, is_active: bool | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Client)
        if status: stmt = stmt.where(Client.status == status)
        if client_type: stmt = stmt.where(Client.client_type == client_type)
        if assigned_to: stmt = stmt.where(Client.assigned_to == assigned_to)
        if branch_id: stmt = stmt.where(Client.branch_id == branch_id)
        if is_active is not None: stmt = stmt.where(Client.is_active == is_active)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        result = await self._db.execute(stmt)
        return result.scalar_one()


class ClientContactRepository(BaseRepository[ClientContact]):
    model = ClientContact
    searchable_columns = [ClientContact.name, ClientContact.email]

    async def list_by_client(self, client_id: uuid.UUID) -> Sequence[ClientContact]:
        result = await self._db.execute(
            select(ClientContact).where(ClientContact.client_id == client_id).order_by(ClientContact.is_primary.desc())
        )
        return result.scalars().all()


class ClientAddressRepository(BaseRepository[ClientAddress]):
    model = ClientAddress

    async def list_by_client(self, client_id: uuid.UUID) -> Sequence[ClientAddress]:
        result = await self._db.execute(
            select(ClientAddress).where(ClientAddress.client_id == client_id).order_by(ClientAddress.is_primary.desc())
        )
        return result.scalars().all()


class ClientDocumentRepository(BaseRepository[ClientDocument]):
    model = ClientDocument

    async def list_by_client(self, client_id: uuid.UUID) -> Sequence[ClientDocument]:
        result = await self._db.execute(
            select(ClientDocument).where(ClientDocument.client_id == client_id).order_by(ClientDocument.created_at.desc())
        )
        return result.scalars().all()


class ClientNoteRepository(BaseRepository[ClientNote]):
    model = ClientNote

    async def list_by_client(self, client_id: uuid.UUID) -> Sequence[ClientNote]:
        result = await self._db.execute(
            select(ClientNote).where(ClientNote.client_id == client_id).order_by(ClientNote.created_at.desc())
        )
        return result.scalars().all()
