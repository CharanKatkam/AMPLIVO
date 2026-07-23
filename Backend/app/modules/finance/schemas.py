"""Pydantic schemas for the Finance module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

# ── Invoice ──
class InvoiceBase(BaseModel):
    client_id: uuid.UUID
    invoice_number: str = Field(min_length=1, max_length=100)
    status: str = "draft"
    issue_date: date
    due_date: date
    subtotal: float = 0.0
    tax_total: float = 0.0
    total_amount: float = 0.0
    currency: str = "USD"
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
    client_id: uuid.UUID
    invoice_number: str
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
    created_at: datetime

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
