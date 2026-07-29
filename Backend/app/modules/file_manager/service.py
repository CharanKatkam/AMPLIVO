"""Service for the File Manager module."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.file_manager.models import FileFolder, File
from app.modules.file_manager.repository import FileFolderRepository, FileRepository
from app.modules.file_manager.schemas import FileFolderCreate, FileCreate
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope


class FileFolderService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = FileFolderRepository(session)

    async def list_all(self, *, client_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[FileFolder]:
        return await self._repo.get_all_filtered(client_id=client_id, offset=skip, limit=limit)

    async def get(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> FileFolder:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("Folder")
        enforce_client_scope(obj.client_id, scoped_client_id)
        return obj

    async def create(self, data: FileFolderCreate) -> FileFolder:
        return await self._repo.create_from_dict(data.model_dump())

    async def delete(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get(id, scoped_client_id=scoped_client_id)
        await self._repo.delete(id)


class FileService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = FileRepository(session)

    async def list_all(self, *, client_id: uuid.UUID | None = None, folder_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[File]:
        return await self._repo.get_all_filtered(client_id=client_id, folder_id=folder_id, offset=skip, limit=limit)

    async def get(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> File:
        obj = await self._repo.get_by_id(id)
        if not obj:
            raise NotFoundException("File")
        enforce_client_scope(obj.client_id, scoped_client_id)
        return obj

    async def create(self, data: FileCreate) -> File:
        return await self._repo.create_from_dict(data.model_dump())

    async def delete(self, id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get(id, scoped_client_id=scoped_client_id)
        await self._repo.delete(id)
