import logging
import uuid

from app.models.audit_log import AuditAction, AuditStatus
from app.repositories.audit_log_repository import AuditLogRepository
from app.utils.request_context import ClientContext

logger = logging.getLogger("app.audit")


class AuditService:
    def __init__(self, audit_log_repository: AuditLogRepository) -> None:
        self._audit_log_repository = audit_log_repository

    async def log(
        self,
        *,
        user_id: uuid.UUID | None,
        action: AuditAction,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
        status: AuditStatus,
        message: str,
        module: str = "auth",
    ) -> None:
        try:
            new_data = {
                "endpoint": endpoint,
                "request_method": request_method,
                "status": status.value,
                "message": message,
                "module": module,
                "user_agent": client_context.user_agent,
            }
            await self._audit_log_repository.create(
                table_name="auth",
                action=action.value,
                new_data=new_data,
                performed_by=user_id,
                ip_address=client_context.ip_address,
            )
        except Exception:
            logger.warning(
                "Failed to write audit log (action=%s endpoint=%s): %s",
                action.value,
                endpoint,
                "audit_logs table may not match the expected schema.",
            )
