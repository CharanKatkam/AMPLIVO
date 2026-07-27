"""Unauthenticated ("magic link") routes for a client to act on a proposal
or submit payment proof BEFORE any portal login/User account exists for
them - mounted at /public, deliberately separate from the authenticated
/portal prefix (app/modules/client_portal) so "requires login" vs "token
only" is unambiguous at a glance.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.crm.dependencies import get_proposal_service
from app.modules.crm.service import ProposalService
from app.modules.finance.dependencies import get_invoice_service, get_payment_service
from app.modules.finance.service import InvoiceService, PaymentService
from app.modules.portal_access.dependencies import get_portal_access_token_service
from app.modules.portal_access.service import PortalAccessTokenService
from app.modules.public_client_actions.schemas import (
    ClientPaymentSubmitRequest, ClientPaymentSubmitResponse, InvoicePublicRead,
    ProposalDecisionRequest, ProposalPublicRead,
)

router = APIRouter(prefix="/public", tags=["Public — Client Actions (no login)"])


@router.get("/proposals/{token}", response_model=ProposalPublicRead, summary="View a proposal via its magic link")
async def get_public_proposal(
    token: str,
    token_svc: PortalAccessTokenService = Depends(get_portal_access_token_service),
    proposal_svc: ProposalService = Depends(get_proposal_service),
):
    access = await token_svc.validate(token, resource_type="proposal")
    proposal = await proposal_svc.get_proposal(access.resource_id)
    return ProposalPublicRead.model_validate(proposal, from_attributes=True)


@router.post("/proposals/{token}/decision", response_model=ProposalPublicRead, summary="Accept / reject / request revision on a proposal")
async def decide_public_proposal(
    token: str, payload: ProposalDecisionRequest, db: AsyncSession = Depends(get_db),
    token_svc: PortalAccessTokenService = Depends(get_portal_access_token_service),
    proposal_svc: ProposalService = Depends(get_proposal_service),
):
    access = await token_svc.validate(token, resource_type="proposal")
    proposal = await proposal_svc.record_client_decision(access.resource_id, decision=payload.decision, notes=payload.notes)
    await token_svc.consume(access)
    await db.commit()
    return ProposalPublicRead.model_validate(proposal, from_attributes=True)


@router.get("/invoices/{token}", response_model=InvoicePublicRead, summary="View an invoice and its balance due via its magic link")
async def get_public_invoice(
    token: str,
    token_svc: PortalAccessTokenService = Depends(get_portal_access_token_service),
    invoice_svc: InvoiceService = Depends(get_invoice_service),
):
    access = await token_svc.validate(token, resource_type="invoice_payment")
    invoice = await invoice_svc.get_invoice(access.resource_id)
    confirmed_statuses = {"crm_verified", "completed"}
    verified_total = sum(p.amount for p in invoice.payments if p.status in confirmed_statuses)
    return InvoicePublicRead(
        id=invoice.id, invoice_number=invoice.invoice_number, invoice_type=invoice.invoice_type,
        status=invoice.status, currency=invoice.currency, total_amount=invoice.total_amount,
        balance_due=max(0.0, invoice.total_amount - verified_total), due_date=str(invoice.due_date),
    )


@router.post("/invoices/{token}/payments", response_model=ClientPaymentSubmitResponse, status_code=status.HTTP_201_CREATED, summary="Submit proof of payment for an invoice")
async def submit_public_payment(
    token: str, payload: ClientPaymentSubmitRequest, db: AsyncSession = Depends(get_db),
    token_svc: PortalAccessTokenService = Depends(get_portal_access_token_service),
    payment_svc: PaymentService = Depends(get_payment_service),
):
    access = await token_svc.validate(token, resource_type="invoice_payment")
    payment = await payment_svc.submit_client_payment(
        access.resource_id,
        {"amount": payload.amount, "payment_method": payload.payment_method, "reference_number": payload.reference_number},
        token_id=access.id,
    )
    await db.commit()
    return ClientPaymentSubmitResponse.model_validate(payment, from_attributes=True)
