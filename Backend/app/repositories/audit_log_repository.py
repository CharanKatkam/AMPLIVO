import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

logger = logging.getLogger("app.audit")


class AuditLogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        table_name: str | None = None,
        record_id: uuid.UUID | None = None,
        action: str,
        old_data: dict | None = None,
        new_data: dict | None = None,
        performed_by: uuid.UUID | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        audit_log = AuditLog(
            table_name=table_name,
            record_id=record_id,
            action=action,
            old_data=old_data,
            new_data=new_data,
            performed_by=performed_by,
            ip_address=ip_address,
        )
        self._db.add(audit_log)
        await self._db.flush()
        return audit_log

    async def list_by_user(self, user_id: uuid.UUID, *, limit: int = 50) -> list[AuditLog]:
        result = await self._db.execute(
            select(AuditLog)
            .where(AuditLog.performed_by == user_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars())
