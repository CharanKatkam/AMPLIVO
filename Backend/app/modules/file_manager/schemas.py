"""Pydantic schemas for the File Manager module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FileFolderBase(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class FileFolderCreate(FileFolderBase):
    pass


class FileFolderRead(FileFolderBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class FileBase(BaseModel):
    name: str
    original_name: str
    mime_type: Optional[str] = None
    size: Optional[int] = None
    url: str
    folder_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    uploaded_by: Optional[uuid.UUID] = None


class FileCreate(FileBase):
    pass


class FileRead(FileBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
