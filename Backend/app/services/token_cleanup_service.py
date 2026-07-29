from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification_token import EmailVerificationToken
from app.models.password_reset_token import PasswordResetToken
from app.utils.time import utc_now


class TokenCleanupService:
    """Deletes expired email-verification and password-reset tokens.

    Invoke periodically from outside the app process - a cron job, a
    Kubernetes CronJob, Windows Task Scheduler, etc. - by running
    `python -m app.scripts.cleanup_expired_tokens`. No scheduler library is
    wired into the app itself since none is part of this project's stack.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def delete_expired_verification_tokens(self) -> int:
        result = await self._db.execute(
            delete(EmailVerificationToken).where(EmailVerificationToken.expires_at < utc_now())
        )
        return result.rowcount or 0

    async def delete_expired_password_reset_tokens(self) -> int:
        result = await self._db.execute(
            delete(PasswordResetToken).where(PasswordResetToken.expires_at < utc_now())
        )
        return result.rowcount or 0

    async def run(self) -> dict[str, int]:
        verification_deleted = await self.delete_expired_verification_tokens()
        reset_deleted = await self.delete_expired_password_reset_tokens()
        await self._db.commit()
        return {
            "verification_tokens_deleted": verification_deleted,
            "password_reset_tokens_deleted": reset_deleted,
        }
