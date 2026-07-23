import asyncio
import logging

from app.db.session import AsyncSessionLocal
from app.services.token_cleanup_service import TokenCleanupService

logger = logging.getLogger("app.scripts.cleanup_expired_tokens")


async def main() -> None:
    async with AsyncSessionLocal() as session:
        service = TokenCleanupService(session)
        result = await service.run()
        logger.info(
            "Token cleanup complete: %s verification token(s), %s password reset token(s) deleted.",
            result["verification_tokens_deleted"],
            result["password_reset_tokens_deleted"],
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
