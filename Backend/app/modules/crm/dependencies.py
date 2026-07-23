"""DI factories for the CRM module."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.crm.repository import *
from app.modules.crm.service import *

def get_client_service(db: AsyncSession = Depends(get_db)) -> ClientService:
    return ClientService(db, ClientRepository(db))

def get_client_contact_service(db: AsyncSession = Depends(get_db)) -> ClientContactService:
    return ClientContactService(db, ClientContactRepository(db))

def get_client_address_service(db: AsyncSession = Depends(get_db)) -> ClientAddressService:
    return ClientAddressService(db, ClientAddressRepository(db))

def get_client_document_service(db: AsyncSession = Depends(get_db)) -> ClientDocumentService:
    return ClientDocumentService(db, ClientDocumentRepository(db))

def get_client_note_service(db: AsyncSession = Depends(get_db)) -> ClientNoteService:
    return ClientNoteService(db, ClientNoteRepository(db))
