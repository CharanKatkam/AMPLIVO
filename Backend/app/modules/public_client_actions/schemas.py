"""Pydantic schemas for the unauthenticated (magic-link) client-facing
endpoints - deliberately minimal, since these are public responses."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import Field

from app.core.sanitizers import SanitizedModel


class ProposalPublicRead(SanitizedModel):
    id: uuid.UUID
    title: str
    description: str | None
    amount: float | None
    status: str
    decision_notes: str | None


class ProposalDecisionRequest(SanitizedModel):
    decision: Literal["accept", "reject", "revise"]
    notes: str | None = None


class InvoicePublicRead(SanitizedModel):
    id: uuid.UUID
    invoice_number: str
    invoice_type: str
    status: str
    currency: str
    total_amount: float
    balance_due: float
    due_date: datetime | str


class ClientPaymentSubmitRequest(SanitizedModel):
    amount: float = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=100)
    reference_number: str | None = None


class ClientPaymentSubmitResponse(SanitizedModel):
    id: uuid.UUID
    amount: float
    payment_method: str
    reference_number: str | None
    status: str
