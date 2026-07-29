"""Repository layer for Finance."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.finance.models import Expense, Invoice, InvoiceItem, Payment
from app.repositories.base import BaseRepository

class InvoiceRepository(BaseRepository[Invoice]):
    model = Invoice
    searchable_columns = [Invoice.invoice_number, Invoice.notes]
    async def get_detail(self, invoice_id: uuid.UUID) -> Invoice | None:
        stmt = select(Invoice).options(selectinload(Invoice.items), selectinload(Invoice.payments)).where(Invoice.id == invoice_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_advance_for_lead(self, lead_id: uuid.UUID) -> Invoice | None:
        stmt = select(Invoice).where(Invoice.lead_id == lead_id, Invoice.invoice_type == "advance").order_by(Invoice.created_at.desc())
        return (await self._db.execute(stmt)).scalars().first()
    async def exists_final_for_project(self, project_id: uuid.UUID) -> bool:
        stmt = select(func.count()).select_from(Invoice).where(Invoice.project_id == project_id, Invoice.invoice_type == "final")
        return (await self._db.execute(stmt)).scalar_one() > 0
    async def get_all_filtered(self, *, search=None, client_id=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Invoice]:
        stmt = select(Invoice)
        if client_id: stmt = stmt.where(Invoice.client_id == client_id)
        if status: stmt = stmt.where(Invoice.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Invoice, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, status=None) -> int:
        stmt = select(func.count()).select_from(Invoice)
        if client_id: stmt = stmt.where(Invoice.client_id == client_id)
        if status: stmt = stmt.where(Invoice.status == status)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class InvoiceItemRepository(BaseRepository[InvoiceItem]):
    model = InvoiceItem
    async def list_by_invoice(self, invoice_id: uuid.UUID) -> Sequence[InvoiceItem]:
        r = await self._db.execute(select(InvoiceItem).where(InvoiceItem.invoice_id == invoice_id).order_by(InvoiceItem.created_at))
        return r.scalars().all()

class PaymentRepository(BaseRepository[Payment]):
    model = Payment
    async def list_by_invoice(self, invoice_id: uuid.UUID) -> Sequence[Payment]:
        r = await self._db.execute(select(Payment).where(Payment.invoice_id == invoice_id).order_by(Payment.payment_date.desc()))
        return r.scalars().all()
    async def get_all_filtered(self, *, status=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Payment]:
        stmt = select(Payment)
        if status: stmt = stmt.where(Payment.status == status)
        stmt = apply_sorting(stmt, model=Payment, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, status=None) -> int:
        stmt = select(func.count()).select_from(Payment)
        if status: stmt = stmt.where(Payment.status == status)
        return (await self._db.execute(stmt)).scalar_one()

class ExpenseRepository(BaseRepository[Expense]):
    model = Expense
    searchable_columns = [Expense.category, Expense.description]
    async def get_all_filtered(self, *, search=None, category=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Expense]:
        stmt = select(Expense)
        if category: stmt = stmt.where(Expense.category == category)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Expense, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, category=None) -> int:
        stmt = select(func.count()).select_from(Expense)
        if category: stmt = stmt.where(Expense.category == category)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()
