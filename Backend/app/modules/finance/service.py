"""Service layer for Finance."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.finance.models import Expense, Invoice, InvoiceItem, Payment
from app.modules.finance.repository import ExpenseRepository, InvoiceItemRepository, InvoiceRepository, PaymentRepository
from app.utils.sales_events import notify_users

# Statuses worth notifying the client's account owner about (maps onto the
# Sales module's "quotation sent / approved / rejected" lifecycle, reusing
# the existing Invoice status field rather than a separate Quotation model).
_NOTIFIABLE_STATUSES = {
    "sent": "Quote/invoice sent",
    "paid": "Invoice paid",
    "cancelled": "Invoice cancelled",
    "overdue": "Invoice overdue",
}

class InvoiceService:
    def __init__(self, db: AsyncSession, repo: InvoiceRepository) -> None:
        self._db = db
        self._repo = repo
    async def list_invoices(self, *, search=None, client_id=None, status=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, status=status, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, status=status)
        return items, total
    async def get_invoice(self, invoice_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Invoice:
        i = await self._repo.get_detail(invoice_id)
        if i is None: raise NotFoundException("Invoice")
        enforce_client_scope(i.client_id, scoped_client_id)
        return i
    async def create_invoice(self, data: dict) -> Invoice:
        invoice = await self._repo.create_from_dict(data)
        if invoice.status and invoice.status.lower() in _NOTIFIABLE_STATUSES:
            await self._notify_status(invoice, invoice.status)
        return invoice
    async def update_invoice(self, invoice_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> Invoice:
        existing = await self.get_invoice(invoice_id, scoped_client_id=scoped_client_id)
        old_status = existing.status
        updated = await self._repo.update(invoice_id, data)
        if updated is None: raise NotFoundException("Invoice")
        new_status = data.get("status")
        if new_status and new_status != old_status and new_status.lower() in _NOTIFIABLE_STATUSES:
            await self._notify_status(updated, new_status)
        return updated
    async def delete_invoice(self, invoice_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_invoice(invoice_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(invoice_id): raise NotFoundException("Invoice")
    async def _notify_status(self, invoice: Invoice, new_status: str) -> None:
        from app.modules.crm.models import Client
        client = await self._db.get(Client, invoice.client_id)
        if client is None or client.assigned_to is None:
            return
        title = _NOTIFIABLE_STATUSES.get(new_status.lower(), "Invoice updated")
        await notify_users(
            self._db, [client.assigned_to],
            title=title,
            message=f"Invoice {invoice.invoice_number} for {client.company_name} is now '{new_status}'.",
        )

class InvoiceItemService:
    def __init__(self, repo: InvoiceItemRepository) -> None:
        self._repo = repo
    async def list_items(self, invoice_id: uuid.UUID) -> Sequence[InvoiceItem]:
        return await self._repo.list_by_invoice(invoice_id)
    async def create_item(self, invoice_id: uuid.UUID, data: dict) -> InvoiceItem:
        data["invoice_id"] = invoice_id
        return await self._repo.create_from_dict(data)
    async def update_item(self, item_id: uuid.UUID, data: dict) -> InvoiceItem:
        updated = await self._repo.update(item_id, data)
        if updated is None: raise NotFoundException("InvoiceItem")
        return updated
    async def delete_item(self, item_id: uuid.UUID) -> None:
        if not await self._repo.delete(item_id): raise NotFoundException("InvoiceItem")

class PaymentService:
    def __init__(self, repo: PaymentRepository) -> None:
        self._repo = repo
    async def list_payments(self, invoice_id: uuid.UUID) -> Sequence[Payment]:
        return await self._repo.list_by_invoice(invoice_id)
    async def create_payment(self, invoice_id: uuid.UUID, data: dict) -> Payment:
        data["invoice_id"] = invoice_id
        return await self._repo.create_from_dict(data)
    async def update_payment(self, payment_id: uuid.UUID, data: dict) -> Payment:
        updated = await self._repo.update(payment_id, data)
        if updated is None: raise NotFoundException("Payment")
        return updated
    async def delete_payment(self, payment_id: uuid.UUID) -> None:
        if not await self._repo.delete(payment_id): raise NotFoundException("Payment")

class ExpenseService:
    def __init__(self, repo: ExpenseRepository) -> None:
        self._repo = repo
    async def list_expenses(self, *, search=None, category=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, category=category, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, category=category)
        return items, total
    async def get_expense(self, expense_id: uuid.UUID) -> Expense:
        e = await self._repo.get_by_id(expense_id)
        if e is None: raise NotFoundException("Expense")
        return e
    async def create_expense(self, data: dict, logged_by: uuid.UUID | None = None) -> Expense:
        data["logged_by"] = logged_by
        return await self._repo.create_from_dict(data)
    async def update_expense(self, expense_id: uuid.UUID, data: dict) -> Expense:
        updated = await self._repo.update(expense_id, data)
        if updated is None: raise NotFoundException("Expense")
        return updated
    async def delete_expense(self, expense_id: uuid.UUID) -> None:
        if not await self._repo.delete(expense_id): raise NotFoundException("Expense")
