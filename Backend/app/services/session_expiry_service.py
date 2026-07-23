from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.audit_log import AuditAction, AuditStatus
from app.repositories.user_session_repository import UserSessionRepository
from app.services.audit_service import AuditService
from app.utils.request_context import SYSTEM_CLIENT_CONTEXT
from app.utils.time import utc_now


class SessionExpiryService:
    """Marks inactive/expired sessions as no longer active.

    Invoke periodically from outside the app process - see
    app.scripts.expire_stale_sessions - the same way Phase 3's token cleanup
    is invoked; no scheduler library is part of this project's stack.
    """

    def __init__(
        self,
        db: AsyncSession,
        user_session_repository: UserSessionRepository,
        audit_service: AuditService,
    ) -> None:
        self._db = db
        self._user_session_repository = user_session_repository
        self._audit_service = audit_service

    async def expire_stale_sessions(self) -> int:
        cutoff = utc_now() - timedelta(minutes=settings.SESSION_INACTIVITY_TIMEOUT_MINUTES)
        stale_sessions = await self._user_session_repository.find_and_expire_stale_sessions(
            inactivity_cutoff=cutoff
        )

        for session in stale_sessions:
            await self._audit_service.log(
                user_id=session.user_id,
                action=AuditAction.SESSION_EXPIRED,
                endpoint="system:session-expiry",
                request_method="SYSTEM",
                client_context=SYSTEM_CLIENT_CONTEXT,
                status=AuditStatus.SUCCESS,
                message="Session expired due to inactivity or reaching its expiry time.",
            )

        await self._db.commit()
        return len(stale_sessions)
