"""Pydantic schemas for the Finance module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

# ── Invoice ──
class InvoiceBase(BaseModel):
    # One of client_id/lead_id must be set (DB check constraint) - an advance
    # invoice is created against a Lead, before any Client exists.
    client_id: uuid.UUID | None = None
    lead_id: uuid.UUID | None = None
    proposal_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    task_submission_id: uuid.UUID | None = None
    invoice_number: str = Field(min_length=1, max_length=100)
    invoice_type: str = "standard"  # standard | advance | final
    status: str = "draft"
    issue_date: date
    due_date: date
    subtotal: float = 0.0
    tax_total: float = 0.0
    total_amount: float = 0.0
    currency: str = "INR"
    notes: str | None = None

class InvoiceCreate(InvoiceBase): pass
class InvoiceUpdate(BaseModel):
    client_id: uuid.UUID | None = None
    invoice_number: str | None = Field(None, min_length=1, max_length=100)
    status: str | None = None
    issue_date: date | None = None
    due_date: date | None = None
    subtotal: float | None = None
    tax_total: float | None = None
    total_amount: float | None = None
    currency: str | None = None
    notes: str | None = None

class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    client_id: uuid.UUID | None
    lead_id: uuid.UUID | None
    proposal_id: uuid.UUID | None
    project_id: uuid.UUID | None
    task_submission_id: uuid.UUID | None
    invoice_number: str
    invoice_type: str
    status: str
    issue_date: date
    due_date: date
    subtotal: float
    tax_total: float
    total_amount: float
    currency: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

class AdvanceInvoiceCreateRequest(BaseModel):
    """Generates the 25% advance invoice for a lead's accepted proposal -
    the server computes the split and invoice number; the client only
    supplies the deal total and due date."""
    lead_id: uuid.UUID
    proposal_id: uuid.UUID | None = None
    total_deal_amount: float = Field(gt=0)
    tax_rate: float = Field(0.0, ge=0, le=100)
    due_date: date
    currency: str = "INR"
    notes: str | None = None

class FinalInvoiceCreateRequest(BaseModel):
    project_id: uuid.UUID
    task_submission_id: uuid.UUID | None = None
    total_deal_amount: float = Field(gt=0)
    tax_rate: float = Field(0.0, ge=0, le=100)
    due_date: date
    currency: str = "INR"
    notes: str | None = None

# ── InvoiceItem ──
class InvoiceItemBase(BaseModel):
    description: str = Field(min_length=1)
    quantity: float = 1.0
    unit_price: float
    tax_rate: float = 0.0
    total: float

class InvoiceItemCreate(InvoiceItemBase): pass
class InvoiceItemUpdate(BaseModel):
    description: str | None = Field(None, min_length=1)
    quantity: float | None = None
    unit_price: float | None = None
    tax_rate: float | None = None
    total: float | None = None

class InvoiceItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    invoice_id: uuid.UUID
    description: str
    quantity: float
    unit_price: float
    tax_rate: float
    total: float
    created_at: datetime

# ── Payment ──
class PaymentBase(BaseModel):
    amount: float
    payment_date: date
    payment_method: str = Field(min_length=1, max_length=100)
    reference_number: str | None = None
    status: str = "completed"

class PaymentCreate(PaymentBase): pass
class PaymentUpdate(BaseModel):
    amount: float | None = None
    payment_date: date | None = None
    payment_method: str | None = Field(None, min_length=1, max_length=100)
    reference_number: str | None = None
    status: str | None = None

class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    invoice_id: uuid.UUID
    amount: float
    payment_date: date
    payment_method: str
    reference_number: str | None
    status: str
    submitted_by_client: bool
    finance_verified_by: uuid.UUID | None
    finance_verified_at: datetime | None
    crm_verified_by: uuid.UUID | None
    crm_verified_at: datetime | None
    created_at: datetime

class ClientPaymentSubmitRequest(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=100)
    reference_number: str | None = None
    payment_date: date | None = None

class PaymentRejectRequest(BaseModel):
    reason: str | None = None

# ── Expense ──
class ExpenseBase(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    amount: float
    currency: str = "USD"
    expense_date: date
    description: str | None = None
    receipt_url: str | None = None

class ExpenseCreate(ExpenseBase): pass
class ExpenseUpdate(BaseModel):
    category: str | None = Field(None, min_length=1, max_length=100)
    amount: float | None = None
    currency: str | None = None
    expense_date: date | None = None
    description: str | None = None
    receipt_url: str | None = None

class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    category: str
    amount: float
    currency: str
    expense_date: date
    description: str | None
    receipt_url: str | None
    logged_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
