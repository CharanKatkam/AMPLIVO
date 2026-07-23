import uuid
from datetime import datetime

from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_session import UserSession
from app.utils.time import utc_now


class UserSessionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        refresh_token_id: uuid.UUID | None,
        device_name: str | None,
        browser: str | None,
        operating_system: str | None,
        ip_address: str | None,
        country: str | None,
        city: str | None,
        expires_at: datetime,
    ) -> UserSession:
        session = UserSession(
            id=session_id,
            user_id=user_id,
            refresh_token_id=refresh_token_id,
            device_name=device_name,
            browser=browser,
            operating_system=operating_system,
            ip_address=ip_address,
            country=country,
            city=city,
            is_active=True,
            last_activity=utc_now(),
            expires_at=expires_at,
        )
        self._db.add(session)
        await self._db.flush()
        await self._db.refresh(session)
        return session

    async def get_by_id(self, session_id: uuid.UUID) -> UserSession | None:
        result = await self._db.execute(select(UserSession).where(UserSession.id == session_id))
        return result.scalar_one_or_none()

    async def get_active_by_id_for_user(
        self, session_id: uuid.UUID, user_id: uuid.UUID
    ) -> UserSession | None:
        result = await self._db.execute(
            select(UserSession).where(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
                UserSession.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_refresh_token_id(self, refresh_token_id: uuid.UUID) -> UserSession | None:
        result = await self._db.execute(
            select(UserSession).where(
                UserSession.refresh_token_id == refresh_token_id, UserSession.is_active.is_(True)
            )
        )
        return result.scalar_one_or_none()

    async def list_active_for_user(self, user_id: uuid.UUID) -> list[UserSession]:
        result = await self._db.execute(
            select(UserSession)
            .where(UserSession.user_id == user_id, UserSession.is_active.is_(True))
            .order_by(UserSession.last_activity.desc())
        )
        return list(result.scalars())

    async def list_all_for_user(self, user_id: uuid.UUID) -> list[UserSession]:
        result = await self._db.execute(
            select(UserSession)
            .where(UserSession.user_id == user_id)
            .order_by(UserSession.last_activity.desc())
        )
        return list(result.scalars())

    async def exists_matching_device_for_user(
        self,
        user_id: uuid.UUID,
        *,
        browser: str | None,
        operating_system: str | None,
        device_name: str | None,
    ) -> bool:
        result = await self._db.execute(
            select(UserSession.id)
            .where(
                UserSession.user_id == user_id,
                UserSession.browser == browser,
                UserSession.operating_system == operating_system,
                UserSession.device_name == device_name,
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def reassign_refresh_token_and_touch(
        self, session: UserSession, *, new_refresh_token_id: uuid.UUID, expires_at: datetime
    ) -> None:
        session.refresh_token_id = new_refresh_token_id
        session.last_activity = utc_now()
        session.expires_at = expires_at
        await self._db.flush()

    async def touch_last_activity(self, session_id: uuid.UUID) -> None:
        """Lightweight, PK-scoped bulk UPDATE with no ORM load - used by
        ActivityMiddleware, which only has a session_id (no loaded object)
        and must be cheap enough to run on every authenticated request.
        """
        await self._db.execute(
            update(UserSession)
            .where(UserSession.id == session_id, UserSession.is_active.is_(True))
            .values(last_activity=utc_now())
        )

    async def revoke(self, session: UserSession) -> None:
        session.is_active = False
        await self._db.flush()

    async def revoke_all_for_user_except(
        self, user_id: uuid.UUID, *, except_session_id: uuid.UUID | None
    ) -> int:
        stmt = update(UserSession).where(UserSession.user_id == user_id, UserSession.is_active.is_(True))
        if except_session_id is not None:
            stmt = stmt.where(UserSession.id != except_session_id)
        stmt = stmt.values(is_active=False)
        result = await self._db.execute(stmt)
        await self._db.flush()
        return result.rowcount or 0

    async def find_and_expire_stale_sessions(self, *, inactivity_cutoff: datetime) -> list[UserSession]:
        now = utc_now()
        result = await self._db.execute(
            select(UserSession).where(
                UserSession.is_active.is_(True),
                or_(UserSession.last_activity < inactivity_cutoff, UserSession.expires_at < now),
            )
        )
        stale_sessions = list(result.scalars())
        for session in stale_sessions:
            session.is_active = False
        await self._db.flush()
        return stale_sessions
