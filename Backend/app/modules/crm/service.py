"""Service layer for the CRM module."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Any, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import lead_pipeline
from app.core.exceptions import BadRequestException, NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.crm.models import Client, ClientAddress, ClientContact, ClientDocument, ClientNote, Proposal
from app.modules.crm.repository import (
    ClientAddressRepository, ClientContactRepository, ClientDocumentRepository,
    ClientNoteRepository, ClientRepository, ProposalRepository,
)
from app.utils.sales_events import log_activity, notify_role, notify_users


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
        client = await self._repo.create_from_dict(data)
        if client.assigned_to:
            await notify_users(
                self._db, [client.assigned_to],
                title="Client assigned to you", message=f"'{client.company_name}' has been assigned to you.",
            )
        await log_activity(
            self._db, user_id=created_by, entity_type="client", entity_id=client.id,
            action="client_created", description=f"Client '{client.company_name}' created.",
        )
        return client

    async def update_client(self, client_id: uuid.UUID, data: dict[str, Any], *, scoped_client_id: uuid.UUID | None = None, actor_id: uuid.UUID | None = None) -> Client:
        existing = await self.get_client(client_id, scoped_client_id=scoped_client_id)
        old_assigned_to = existing.assigned_to
        old_status = existing.status
        updated = await self._repo.update(client_id, data)
        if updated is None:
            raise NotFoundException("Client")

        new_assigned_to = data.get("assigned_to")
        if new_assigned_to and new_assigned_to != old_assigned_to:
            await notify_users(
                self._db, [new_assigned_to],
                title="Client assigned to you", message=f"'{updated.company_name}' has been assigned to you.",
            )
            await log_activity(
                self._db, user_id=actor_id, entity_type="client", entity_id=client_id,
                action="client_assigned", description=f"Client '{updated.company_name}' reassigned.",
            )
        new_status = data.get("status")
        if new_status and new_status != old_status:
            await log_activity(
                self._db, user_id=actor_id, entity_type="client", entity_id=client_id,
                action="status_changed", description=f"Client '{updated.company_name}' status changed from '{old_status}' to '{new_status}'.",
            )
        return updated

    async def delete_client(self, client_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_client(client_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(client_id):
            raise NotFoundException("Client")


class ClientContactService:
    def __init__(self, db: AsyncSession, repo: ClientContactRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_contacts(self, client_id: uuid.UUID) -> Sequence[ClientContact]:
        return await self._repo.list_by_client(client_id)

    async def get_contact(self, contact_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> ClientContact:
        c = await self._repo.get_by_id(contact_id)
        if c is None: raise NotFoundException("ClientContact")
        enforce_client_scope(c.client_id, scoped_client_id)
        return c

    async def create_contact(self, client_id: uuid.UUID, data: dict) -> ClientContact:
        data["client_id"] = client_id
        return await self._repo.create_from_dict(data)

    async def update_contact(self, contact_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> ClientContact:
        await self.get_contact(contact_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(contact_id, data)
        if updated is None: raise NotFoundException("ClientContact")
        return updated

    async def delete_contact(self, contact_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_contact(contact_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(contact_id): raise NotFoundException("ClientContact")


class ClientAddressService:
    def __init__(self, db: AsyncSession, repo: ClientAddressRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_addresses(self, client_id: uuid.UUID) -> Sequence[ClientAddress]:
        return await self._repo.list_by_client(client_id)

    async def get_address(self, address_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> ClientAddress:
        a = await self._repo.get_by_id(address_id)
        if a is None: raise NotFoundException("ClientAddress")
        enforce_client_scope(a.client_id, scoped_client_id)
        return a

    async def create_address(self, client_id: uuid.UUID, data: dict) -> ClientAddress:
        data["client_id"] = client_id
        return await self._repo.create_from_dict(data)

    async def update_address(self, address_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> ClientAddress:
        await self.get_address(address_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(address_id, data)
        if updated is None: raise NotFoundException("ClientAddress")
        return updated

    async def delete_address(self, address_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_address(address_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(address_id): raise NotFoundException("ClientAddress")


class ClientDocumentService:
    def __init__(self, db: AsyncSession, repo: ClientDocumentRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_documents(self, client_id: uuid.UUID) -> Sequence[ClientDocument]:
        return await self._repo.list_by_client(client_id)

    async def get_document(self, doc_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> ClientDocument:
        d = await self._repo.get_by_id(doc_id)
        if d is None: raise NotFoundException("ClientDocument")
        enforce_client_scope(d.client_id, scoped_client_id)
        return d

    async def create_document(self, client_id: uuid.UUID, data: dict, uploaded_by: uuid.UUID | None = None) -> ClientDocument:
        data["client_id"] = client_id
        data["uploaded_by"] = uploaded_by
        return await self._repo.create_from_dict(data)

    async def delete_document(self, doc_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_document(doc_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(doc_id): raise NotFoundException("ClientDocument")


class ClientNoteService:
    def __init__(self, db: AsyncSession, repo: ClientNoteRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_notes(self, client_id: uuid.UUID) -> Sequence[ClientNote]:
        return await self._repo.list_by_client(client_id)

    async def get_note(self, note_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> ClientNote:
        n = await self._repo.get_by_id(note_id)
        if n is None: raise NotFoundException("ClientNote")
        enforce_client_scope(n.client_id, scoped_client_id)
        return n

    async def create_note(self, client_id: uuid.UUID, data: dict, created_by: uuid.UUID | None = None) -> ClientNote:
        data["client_id"] = client_id
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)

    async def delete_note(self, note_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_note(note_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(note_id): raise NotFoundException("ClientNote")


class ProposalService:
    def __init__(self, db: AsyncSession, repo: ProposalRepository) -> None:
        self._db = db
        self._repo = repo

    async def list_proposals(self, *, search=None, status=None, client_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, status=status, client_id=client_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, status=status, client_id=client_id)
        return items, total

    async def get_proposal(self, proposal_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Proposal:
        p = await self._repo.get_by_id(proposal_id)
        if p is None: raise NotFoundException("Proposal")
        enforce_client_scope(p.client_id, scoped_client_id)
        return p

    async def create_proposal(self, client_id: uuid.UUID, data: dict, *, created_by: uuid.UUID | None = None) -> Proposal:
        data["client_id"] = client_id
        data["created_by"] = created_by
        proposal = await self._repo.create_from_dict(data)
        await log_activity(
            self._db, user_id=created_by, entity_type="proposal", entity_id=proposal.id,
            action="proposal_created", description=f"Proposal '{proposal.title}' created.",
        )
        return proposal

    async def list_proposals_for_lead(self, lead_id: uuid.UUID) -> Sequence[Proposal]:
        return await self._repo.list_by_lead(lead_id)

    async def create_proposal_for_lead(self, lead_id: uuid.UUID, data: dict, *, created_by: uuid.UUID | None = None) -> Proposal:
        """A proposal (and its eventual advance invoice) happens at the Lead
        stage, before any Client/User account exists - see migration 0020's
        docstring. Deferred-imports LeadRepository the same way
        LeadService.convert_lead does, to avoid a leads<->crm module cycle."""
        from app.modules.leads.repository import LeadRepository

        lead_repo = LeadRepository(self._db)
        lead = await lead_repo.get_by_id(lead_id)
        if lead is None:
            raise NotFoundException("Lead")

        data["lead_id"] = lead_id
        data["client_id"] = None
        data["created_by"] = created_by
        proposal = await self._repo.create_from_dict(data)

        lead.status = lead_pipeline.PROPOSAL_CREATED
        await self._db.flush()
        await self._db.refresh(lead)

        await log_activity(
            self._db, user_id=created_by, entity_type="proposal", entity_id=proposal.id,
            action="proposal_created", description=f"Proposal '{proposal.title}' created for lead '{lead.title}'.",
        )
        if lead.assigned_to:
            await notify_users(
                self._db, [lead.assigned_to],
                title="Proposal created", message=f"Proposal '{proposal.title}' created for '{lead.title}'.",
            )
        return proposal

    async def record_client_decision(self, proposal_id: uuid.UUID, *, decision: str, notes: str | None) -> Proposal:
        """Client's response to a proposal via the public magic-link (no
        login) - see app/modules/public_client_actions. `decision` is one of
        'accept' | 'reject' | 'revise'."""
        from app.modules.leads.repository import LeadRepository

        proposal = await self._repo.get_by_id(proposal_id)
        if proposal is None:
            raise NotFoundException("Proposal")

        now = datetime.now(timezone.utc)
        if decision == "accept":
            proposal.status = "accepted"
            proposal.decided_at = now
        elif decision == "reject":
            proposal.status = "rejected"
            proposal.decided_at = now
        elif decision == "revise":
            proposal.status = "revision_requested"
        else:
            raise BadRequestException("decision must be one of: accept, reject, revise")
        proposal.decision_notes = notes
        await self._db.flush()
        await self._db.refresh(proposal)

        lead = await LeadRepository(self._db).get_by_id(proposal.lead_id) if proposal.lead_id else None

        if decision == "accept":
            await notify_role(self._db, "sales", title="Proposal accepted", message=f"Client accepted proposal '{proposal.title}'. Create the advance invoice.")
        elif decision == "reject":
            if lead is not None:
                lead.status = lead_pipeline.REJECTED
                await self._db.flush()
            await notify_role(self._db, "sales", title="Proposal rejected", message=f"Client rejected proposal '{proposal.title}'.")
        else:
            await notify_role(self._db, "sales", title="Proposal revision requested", message=f"Client requested changes to proposal '{proposal.title}'." + (f" Notes: {notes}" if notes else ""))

        await log_activity(
            self._db, user_id=None, entity_type="proposal", entity_id=proposal.id,
            action="client_decision", description=f"Client responded to proposal '{proposal.title}': {decision}.",
        )
        return proposal

    async def update_proposal(self, proposal_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None, actor_id: uuid.UUID | None = None) -> Proposal:
        existing = await self.get_proposal(proposal_id, scoped_client_id=scoped_client_id)
        old_status = existing.status
        new_status = data.get("status")
        if new_status and new_status != old_status:
            if new_status == "sent" and not existing.sent_at:
                data["sent_at"] = datetime.now(timezone.utc)
            if new_status in ("accepted", "rejected"):
                data["decided_at"] = datetime.now(timezone.utc)
        updated = await self._repo.update(proposal_id, data)
        if updated is None: raise NotFoundException("Proposal")
        if new_status and new_status != old_status:
            await log_activity(
                self._db, user_id=actor_id, entity_type="proposal", entity_id=proposal_id,
                action="status_changed", description=f"Proposal '{updated.title}' status changed from '{old_status}' to '{new_status}'.",
            )
        return updated

    async def delete_proposal(self, proposal_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_proposal(proposal_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(proposal_id): raise NotFoundException("Proposal")
