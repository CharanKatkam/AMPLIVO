import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification_token import EmailVerificationToken
from app.utils.time import utc_now


class EmailVerificationTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self, *, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> EmailVerificationToken:
        token = EmailVerificationToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self._db.add(token)
        await self._db.flush()
        await self._db.refresh(token)
        return token

    async def get_by_token_hash(self, token_hash: str) -> EmailVerificationToken | None:
        result = await self._db.execute(
            select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def invalidate_unused_for_user(self, user_id: uuid.UUID) -> None:
        """Marks any previously issued, unused tokens for this user as used so
        they can never be redeemed - the table has no separate "invalidated"
        state, so superseded tokens share is_used with genuinely redeemed ones.
        """
        await self._db.execute(
            update(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user_id,
                EmailVerificationToken.is_used.is_(False),
            )
            .values(is_used=True)
        )
        await self._db.flush()

    async def mark_used(self, token: EmailVerificationToken) -> None:
        token.is_used = True
        token.verified_at = utc_now()
        await self._db.flush()
