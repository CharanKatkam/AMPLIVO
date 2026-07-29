import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.password_reset_token import PasswordResetToken
from app.utils.time import utc_now


class PasswordResetTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self, *, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> PasswordResetToken:
        token = PasswordResetToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self._db.add(token)
        await self._db.flush()
        await self._db.refresh(token)
        return token

    async def get_by_token_hash(self, token_hash: str) -> PasswordResetToken | None:
        result = await self._db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def invalidate_unused_for_user(self, user_id: uuid.UUID) -> None:
        await self._db.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.is_used.is_(False),
            )
            .values(is_used=True)
        )
        await self._db.flush()

    async def mark_used(self, token: PasswordResetToken) -> None:
        token.is_used = True
        token.used_at = utc_now()
        await self._db.flush()
