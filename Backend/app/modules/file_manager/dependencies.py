"""Dependencies for the File Manager module."""
from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.file_manager.service import FileFolderService, FileService


def get_file_folder_service(db: AsyncSession = Depends(get_db)) -> FileFolderService:
    return FileFolderService(db)


def get_file_service(db: AsyncSession = Depends(get_db)) -> FileService:
    return FileService(db)
