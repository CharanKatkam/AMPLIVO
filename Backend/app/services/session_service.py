import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import SessionNotFoundException
from app.models.audit_log import AuditAction, AuditStatus
from app.models.user_session import UserSession
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_session_repository import UserSessionRepository
from app.services.audit_service import AuditService
from app.utils.request_context import ClientContext


class SessionService:
    def __init__(
        self,
        db: AsyncSession,
        user_session_repository: UserSessionRepository,
        refresh_token_repository: RefreshTokenRepository,
        audit_service: AuditService,
    ) -> None:
        self._db = db
        self._user_session_repository = user_session_repository
        self._refresh_token_repository = refresh_token_repository
        self._audit_service = audit_service

    async def list_sessions(self, user_id: uuid.UUID) -> list[UserSession]:
        return await self._user_session_repository.list_active_for_user(user_id)

    async def list_devices(self, user_id: uuid.UUID) -> list[UserSession]:
        return await self._user_session_repository.list_all_for_user(user_id)

    async def terminate_session(
        self,
        *,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        session = await self._user_session_repository.get_active_by_id_for_user(session_id, user_id)
        if session is None:
            raise SessionNotFoundException()

        await self._revoke_session(session)

        await self._audit_service.log(
            user_id=user_id,
            action=AuditAction.LOGOUT_DEVICE,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="Session terminated by user.",
        )
        await self._db.commit()

    async def terminate_current_session(
        self,
        *,
        user_id: uuid.UUID,
        current_session_id: uuid.UUID | None,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        if current_session_id is None:
            raise SessionNotFoundException()
        await self.terminate_session(
            user_id=user_id,
            session_id=current_session_id,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
        )

    async def terminate_all_other_sessions(
        self,
        *,
        user_id: uuid.UUID,
        current_session_id: uuid.UUID | None,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> int:
        sessions = await self._user_session_repository.list_active_for_user(user_id)
        terminated = 0
        for session in sessions:
            if current_session_id is not None and session.id == current_session_id:
                continue
            await self._revoke_session(session)
            terminated += 1

        await self._audit_service.log(
            user_id=user_id,
            action=AuditAction.LOGOUT_ALL_DEVICES,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message=f"Terminated {terminated} other session(s).",
        )
        await self._db.commit()
        return terminated

    async def _revoke_session(self, session: UserSession) -> None:
        await self._user_session_repository.revoke(session)
        if session.refresh_token_id is not None:
            refresh_token = await self._refresh_token_repository.get_by_id(session.refresh_token_id)
            if refresh_token is not None and not refresh_token.is_revoked:
                await self._refresh_token_repository.revoke(refresh_token)
