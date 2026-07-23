"""DI factories for Finance."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.finance.repository import *
from app.modules.finance.service import *

def get_invoice_service(db: AsyncSession = Depends(get_db)) -> InvoiceService:
    return InvoiceService(InvoiceRepository(db))

def get_invoice_item_service(db: AsyncSession = Depends(get_db)) -> InvoiceItemService:
    return InvoiceItemService(InvoiceItemRepository(db))

def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(PaymentRepository(db))

def get_expense_service(db: AsyncSession = Depends(get_db)) -> ExpenseService:
    return ExpenseService(ExpenseRepository(db))
