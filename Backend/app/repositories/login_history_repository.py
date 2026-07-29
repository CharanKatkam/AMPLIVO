import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.login_history import LoginHistory, LoginHistoryStatus
from app.utils.time import utc_now


class LoginHistoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        login_time: datetime,
        ip_address: str | None,
        browser: str | None,
        operating_system: str | None,
        device: str | None,
        refresh_token_id: uuid.UUID | None,
    ) -> LoginHistory:
        entry = LoginHistory(
            user_id=user_id,
            login_time=login_time,
            ip_address=ip_address,
            browser=browser,
            operating_system=operating_system,
            device=device,
            status=LoginHistoryStatus.ACTIVE.value,
            refresh_token_id=refresh_token_id,
        )
        self._db.add(entry)
        await self._db.flush()
        await self._db.refresh(entry)
        return entry

    async def get_active_by_refresh_token_id(self, refresh_token_id: uuid.UUID) -> LoginHistory | None:
        result = await self._db.execute(
            select(LoginHistory).where(
                LoginHistory.refresh_token_id == refresh_token_id,
                LoginHistory.status == LoginHistoryStatus.ACTIVE.value,
            )
        )
        return result.scalar_one_or_none()

    async def reassign_refresh_token(
        self, login_history: LoginHistory, new_refresh_token_id: uuid.UUID
    ) -> None:
        login_history.refresh_token_id = new_refresh_token_id
        await self._db.flush()

    async def close_session(self, login_history: LoginHistory) -> None:
        login_history.logout_time = utc_now()
        login_history.status = LoginHistoryStatus.LOGGED_OUT.value
        await self._db.flush()

    async def list_by_user(self, user_id: uuid.UUID, *, limit: int = 50) -> list[LoginHistory]:
        result = await self._db.execute(
            select(LoginHistory)
            .where(LoginHistory.user_id == user_id)
            .order_by(LoginHistory.login_time.desc())
            .limit(limit)
        )
        return list(result.scalars())
