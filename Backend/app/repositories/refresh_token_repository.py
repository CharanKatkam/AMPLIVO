import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken
from app.utils.time import utc_now


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        token_id: uuid.UUID,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
        user_agent: str | None = None,
        ip_address: str | None = None,
        browser: str | None = None,
        operating_system: str | None = None,
        device_name: str | None = None,
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            id=token_id,
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
            browser=browser,
            operating_system=operating_system,
            device_name=device_name,
            last_used=utc_now(),
        )
        self._db.add(refresh_token)
        await self._db.flush()
        await self._db.refresh(refresh_token)
        return refresh_token

    async def get_by_id(self, token_id: uuid.UUID) -> RefreshToken | None:
        result = await self._db.execute(select(RefreshToken).where(RefreshToken.id == token_id))
        return result.scalar_one_or_none()

    async def revoke(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_revoked = True
        refresh_token.revoked_at = utc_now()
        await self._db.flush()

    async def touch_last_used(self, refresh_token: RefreshToken) -> None:
        refresh_token.last_used = utc_now()
        await self._db.flush()

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        """Bulk-revokes every still-active refresh token for a user - used
        after a password reset so any session established with the old
        password is immediately invalidated.
        """
        await self._db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked.is_(False))
            .values(is_revoked=True, revoked_at=utc_now())
        )
        await self._db.flush()
