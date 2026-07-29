"""Generic async CRUD repository.

Every domain repository inherits from ``BaseRepository[T]`` and gets
pagination, search, sorting, soft-delete, and count for free.

Example::

    class ClientRepository(BaseRepository[Client]):
        model = Client
        searchable_columns = [Client.name, Client.email]
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import Select, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.filters import apply_date_range, apply_search, apply_sorting

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Async generic CRUD repository for SQLAlchemy ORM models."""

    model: type[T]
    searchable_columns: list = []  # Override in subclass

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ── Reads ───────────────────────────────────────────────────────────

    async def get_by_id(self, entity_id: uuid.UUID) -> T | None:
        result = await self._db.execute(
            select(self.model).where(self.model.id == entity_id)  # type: ignore[attr-defined]
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        *,
        filters: list | None = None,
        search: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc",
        offset: int = 0,
        limit: int = 20,
        date_column: str = "created_at",
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> Sequence[T]:
        stmt = select(self.model)
        stmt = self._apply_filters(stmt, filters)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        date_col = getattr(self.model, date_column, None)
        if date_col is not None:
            stmt = apply_date_range(stmt, column=date_col, after=created_after, before=created_before)
        stmt = apply_sorting(stmt, model=self.model, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        result = await self._db.execute(stmt)
        return result.scalars().all()

    async def count(
        self,
        *,
        filters: list | None = None,
        search: str | None = None,
        date_column: str = "created_at",
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(self.model)  # type: ignore[arg-type]
        stmt = self._apply_filters(stmt, filters)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        date_col = getattr(self.model, date_column, None)
        if date_col is not None:
            stmt = apply_date_range(stmt, column=date_col, after=created_after, before=created_before)
        result = await self._db.execute(stmt)
        return result.scalar_one()

    async def exists(self, entity_id: uuid.UUID) -> bool:
        stmt = select(func.count()).select_from(self.model).where(  # type: ignore[arg-type]
            self.model.id == entity_id  # type: ignore[attr-defined]
        )
        result = await self._db.execute(stmt)
        return result.scalar_one() > 0

    # ── Writes ──────────────────────────────────────────────────────────

    async def create(self, entity: T) -> T:
        self._db.add(entity)
        await self._db.flush()
        await self._db.refresh(entity)
        return entity

    async def create_from_dict(self, data: dict[str, Any]) -> T:
        entity = self.model(**data)  # type: ignore[call-arg]
        return await self.create(entity)

    async def update(self, entity_id: uuid.UUID, data: dict[str, Any]) -> T | None:
        entity = await self.get_by_id(entity_id)
        if entity is None:
            return None
        for key, value in data.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        await self._db.flush()
        await self._db.refresh(entity)
        return entity

    async def delete(self, entity_id: uuid.UUID) -> bool:
        entity = await self.get_by_id(entity_id)
        if entity is None:
            return False
        await self._db.delete(entity)
        await self._db.flush()
        return True

    async def soft_delete(self, entity_id: uuid.UUID) -> T | None:
        """Marks ``is_deleted=True`` and ``deleted_at=now()``.

        Only works on models that have those columns — otherwise falls
        back to hard delete.
        """
        entity = await self.get_by_id(entity_id)
        if entity is None:
            return None
        if hasattr(entity, "is_deleted"):
            entity.is_deleted = True  # type: ignore[attr-defined]
            if hasattr(entity, "deleted_at"):
                from app.utils.time import utc_now
                entity.deleted_at = utc_now()  # type: ignore[attr-defined]
            await self._db.flush()
            await self._db.refresh(entity)
            return entity
        # fallback: hard delete
        await self._db.delete(entity)
        await self._db.flush()
        return entity

    # ── Helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _apply_filters(stmt: Select, filters: list | None) -> Select:
        """Apply a list of SQLAlchemy where-clause expressions."""
        if filters:
            for f in filters:
                stmt = stmt.where(f)
        return stmt
