"""SQLAlchemy ORM models for the Finance module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.modules.finance import constants as finance_constants

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Nullable because an advance invoice is created against a Lead, before
    # any Client exists (see migration 0020). At least one of lead_id/
    # client_id is always set (DB CHECK constraint ck_invoices_lead_or_client).
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=True)
    lead_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    proposal_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("proposals.id", ondelete="SET NULL"), nullable=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    task_submission_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("task_submissions.id", ondelete="SET NULL"), nullable=True)
    invoice_number: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    # 'standard' (one-off, unrelated to the deal pipeline) | 'advance' (25%) | 'final' (75%)
    invoice_type: Mapped[str] = mapped_column(Text, nullable=False, default=finance_constants.INVOICE_TYPE_STANDARD)
    # For invoice_type='standard': draft, sent, paid, overdue, cancelled.
    # For invoice_type in (advance, final): CRM_PENDING, CRM_APPROVED, EMAIL_SENT, ADVANCE_PAID/FINAL_PAID
    # (app/modules/finance/constants.py) - contextual on invoice_type, not a single shared enum.
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft")
    issue_date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tax_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    currency: Mapped[str] = mapped_column(Text, nullable=False, default="USD")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    items: Mapped[list["InvoiceItem"]] = relationship(back_populates="invoice", cascade="all, delete-orphan")
    payments: Mapped[list["Payment"]] = relationship(back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    tax_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0) # percentage
    total: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    invoice: Mapped["Invoice"] = relationship(back_populates="items")


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    payment_method: Mapped[str] = mapped_column(Text, nullable=False) # credit_card, bank_transfer, cash, etc.
    reference_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    # pending, completed, failed (legacy staff-entered path, unchanged) -or-
    # submitted, finance_verified, crm_verified, rejected (client-submitted
    # two-step verification path - see app/modules/finance/constants.py)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="completed")
    submitted_by_client: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    submitted_via_token_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("portal_access_tokens.id", ondelete="SET NULL"), nullable=True
    )
    finance_verified_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    finance_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    crm_verified_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    crm_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    invoice: Mapped["Invoice"] = relationship(back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(Text, nullable=False) # ads, software, payroll, etc.
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False, default="USD")
    expense_date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    logged_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
