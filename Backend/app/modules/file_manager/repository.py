"""Repository for the File Manager module."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.modules.file_manager.models import FileFolder, File


class FileFolderRepository(BaseRepository[FileFolder]):
    model = FileFolder

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_all_filtered(self, *, client_id: uuid.UUID | None = None, offset: int = 0, limit: int = 100) -> Sequence[FileFolder]:
        stmt = select(FileFolder)
        if client_id:
            stmt = stmt.where(FileFolder.client_id == client_id)
        stmt = stmt.order_by(FileFolder.name).offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()


class FileRepository(BaseRepository[File]):
    model = File

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_all_filtered(self, *, client_id: uuid.UUID | None = None, folder_id: uuid.UUID | None = None, offset: int = 0, limit: int = 100) -> Sequence[File]:
        stmt = select(File)
        if client_id:
            stmt = stmt.where(File.client_id == client_id)
        if folder_id:
            stmt = stmt.where(File.folder_id == folder_id)
        stmt = stmt.order_by(File.created_at.desc()).offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()
