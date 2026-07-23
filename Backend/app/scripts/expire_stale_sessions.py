import asyncio
import logging

from app.db.session import AsyncSessionLocal
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.user_session_repository import UserSessionRepository
from app.services.audit_service import AuditService
from app.services.session_expiry_service import SessionExpiryService

logger = logging.getLogger("app.scripts.expire_stale_sessions")


async def main() -> None:
    async with AsyncSessionLocal() as session:
        service = SessionExpiryService(
            session,
            UserSessionRepository(session),
            AuditService(AuditLogRepository(session)),
        )
        count = await service.expire_stale_sessions()
        logger.info("Session expiry complete: %s session(s) expired.", count)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
