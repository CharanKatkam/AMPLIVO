"""Pydantic schemas for the File Manager module."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.field_types import HttpUrlStr, NameStr
from app.core.sanitizers import SanitizedModel


class FileFolderBase(SanitizedModel):
    name: NameStr
    parent_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None


class FileFolderCreate(FileFolderBase):
    pass


class FileFolderRead(BaseModel):
    id: uuid.UUID
    name: str
    parent_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    created_by: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileBase(SanitizedModel):
    name: NameStr = Field(min_length=1, max_length=300)
    original_name: NameStr = Field(min_length=1, max_length=300)
    mime_type: Optional[str] = Field(None, min_length=1, max_length=200)
    size: Optional[int] = None
    url: HttpUrlStr
    folder_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    uploaded_by: Optional[uuid.UUID] = None


class FileCreate(FileBase):
    pass


class FileRead(BaseModel):
    id: uuid.UUID
    name: str
    original_name: str
    mime_type: Optional[str] = None
    size: Optional[int] = None
    url: str
    folder_id: Optional[uuid.UUID] = None
    client_id: Optional[uuid.UUID] = None
    uploaded_by: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
