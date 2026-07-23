"""API routes for Finance."""
from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_client_id
from app.models.user import User
from app.modules.finance.dependencies import *
from app.modules.finance.schemas import *
from app.modules.finance.service import *

router = APIRouter(prefix="/finance", tags=["Finance"])

# ── Invoices ──
@router.get("/invoices", response_model=PaginatedResponse[InvoiceRead], summary="List invoices")
async def list_invoices(
    params: PaginationParams = Depends(),
    client_id: uuid.UUID | None = Query(None),
    invoice_status: str | None = Query(None, alias="status"),
    svc: InvoiceService = Depends(get_invoice_service),
    _: User = Depends(get_current_user),
    scoped_client_id: uuid.UUID | None = Depends(get_current_client_id),
):
    effective_client_id = scoped_client_id if scoped_client_id is not None else client_id
    items, total = await svc.list_invoices(
        search=params.search, client_id=effective_client_id, status=invoice_status,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[InvoiceRead].create(items=[InvoiceRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/invoices", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED, summary="Create invoice")
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db), svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user)):
    i = await svc.create_invoice(payload.model_dump()); await db.commit()
    return InvoiceRead.model_validate(i)

@router.get("/invoices/{invoice_id}", response_model=InvoiceRead, summary="Get invoice")
async def get_invoice(invoice_id: uuid.UUID, svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    return InvoiceRead.model_validate(await svc.get_invoice(invoice_id, scoped_client_id=scoped_client_id))

@router.put("/invoices/{invoice_id}", response_model=InvoiceRead, summary="Update invoice")
async def update_invoice(invoice_id: uuid.UUID, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db), svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    i = await svc.update_invoice(invoice_id, payload.model_dump(exclude_unset=True), scoped_client_id=scoped_client_id); await db.commit()
    return InvoiceRead.model_validate(i)

@router.delete("/invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete invoice")
async def delete_invoice(invoice_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await svc.delete_invoice(invoice_id, scoped_client_id=scoped_client_id); await db.commit()

# ── Invoice Items ──
@router.get("/invoices/{invoice_id}/items", response_model=list[InvoiceItemRead], summary="List invoice items")
async def list_invoice_items(invoice_id: uuid.UUID, svc: InvoiceItemService = Depends(get_invoice_item_service), invoice_svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await invoice_svc.get_invoice(invoice_id, scoped_client_id=scoped_client_id)
    return [InvoiceItemRead.model_validate(x) for x in await svc.list_items(invoice_id)]

@router.post("/invoices/{invoice_id}/items", response_model=InvoiceItemRead, status_code=status.HTTP_201_CREATED, summary="Add invoice item")
async def create_invoice_item(invoice_id: uuid.UUID, payload: InvoiceItemCreate, db: AsyncSession = Depends(get_db), svc: InvoiceItemService = Depends(get_invoice_item_service), _: User = Depends(get_current_user)):
    item = await svc.create_item(invoice_id, payload.model_dump()); await db.commit()
    return InvoiceItemRead.model_validate(item)

@router.put("/invoice-items/{item_id}", response_model=InvoiceItemRead, summary="Update invoice item")
async def update_invoice_item(item_id: uuid.UUID, payload: InvoiceItemUpdate, db: AsyncSession = Depends(get_db), svc: InvoiceItemService = Depends(get_invoice_item_service), _: User = Depends(get_current_user)):
    item = await svc.update_item(item_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return InvoiceItemRead.model_validate(item)

@router.delete("/invoice-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete invoice item")
async def delete_invoice_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: InvoiceItemService = Depends(get_invoice_item_service), _: User = Depends(get_current_user)):
    await svc.delete_item(item_id); await db.commit()

# ── Payments ──
@router.get("/invoices/{invoice_id}/payments", response_model=list[PaymentRead], summary="List payments for invoice")
async def list_payments(invoice_id: uuid.UUID, svc: PaymentService = Depends(get_payment_service), invoice_svc: InvoiceService = Depends(get_invoice_service), _: User = Depends(get_current_user), scoped_client_id: uuid.UUID | None = Depends(get_current_client_id)):
    await invoice_svc.get_invoice(invoice_id, scoped_client_id=scoped_client_id)
    return [PaymentRead.model_validate(x) for x in await svc.list_payments(invoice_id)]

@router.post("/invoices/{invoice_id}/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED, summary="Add payment")
async def create_payment(invoice_id: uuid.UUID, payload: PaymentCreate, db: AsyncSession = Depends(get_db), svc: PaymentService = Depends(get_payment_service), _: User = Depends(get_current_user)):
    p = await svc.create_payment(invoice_id, payload.model_dump()); await db.commit()
    return PaymentRead.model_validate(p)

@router.put("/payments/{payment_id}", response_model=PaymentRead, summary="Update payment")
async def update_payment(payment_id: uuid.UUID, payload: PaymentUpdate, db: AsyncSession = Depends(get_db), svc: PaymentService = Depends(get_payment_service), _: User = Depends(get_current_user)):
    p = await svc.update_payment(payment_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return PaymentRead.model_validate(p)

@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete payment")
async def delete_payment(payment_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: PaymentService = Depends(get_payment_service), _: User = Depends(get_current_user)):
    await svc.delete_payment(payment_id); await db.commit()

# ── Expenses ──
@router.get("/expenses", response_model=PaginatedResponse[ExpenseRead], summary="List expenses")
async def list_expenses(
    params: PaginationParams = Depends(),
    category: str | None = Query(None),
    svc: ExpenseService = Depends(get_expense_service),
    _: User = Depends(get_current_user),
):
    items, total = await svc.list_expenses(
        search=params.search, category=category,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[ExpenseRead].create(items=[ExpenseRead.model_validate(x) for x in items], total=total, page=params.page, page_size=params.page_size)

@router.post("/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED, summary="Log expense")
async def create_expense(payload: ExpenseCreate, db: AsyncSession = Depends(get_db), svc: ExpenseService = Depends(get_expense_service), current_user: User = Depends(get_current_user)):
    e = await svc.create_expense(payload.model_dump(), logged_by=current_user.id); await db.commit()
    return ExpenseRead.model_validate(e)

@router.get("/expenses/{expense_id}", response_model=ExpenseRead, summary="Get expense")
async def get_expense(expense_id: uuid.UUID, svc: ExpenseService = Depends(get_expense_service), _: User = Depends(get_current_user)):
    return ExpenseRead.model_validate(await svc.get_expense(expense_id))

@router.put("/expenses/{expense_id}", response_model=ExpenseRead, summary="Update expense")
async def update_expense(expense_id: uuid.UUID, payload: ExpenseUpdate, db: AsyncSession = Depends(get_db), svc: ExpenseService = Depends(get_expense_service), _: User = Depends(get_current_user)):
    e = await svc.update_expense(expense_id, payload.model_dump(exclude_unset=True)); await db.commit()
    return ExpenseRead.model_validate(e)

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete expense")
async def delete_expense(expense_id: uuid.UUID, db: AsyncSession = Depends(get_db), svc: ExpenseService = Depends(get_expense_service), _: User = Depends(get_current_user)):
    await svc.delete_expense(expense_id); await db.commit()
