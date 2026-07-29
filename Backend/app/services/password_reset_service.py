from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    PasswordResetTokenExpiredException,
    PasswordResetTokenInvalidException,
    WeakPasswordException,
)
from app.models.audit_log import AuditAction, AuditStatus
from app.repositories.password_reset_token_repository import PasswordResetTokenRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.repositories.user_session_repository import UserSessionRepository
from app.services.audit_service import AuditService
from app.services.email_service import EmailService
from app.utils.password import hash_password, is_strong_password
from app.utils.request_context import ClientContext
from app.utils.time import as_aware_utc, utc_now
from app.utils.tokens import hash_token, new_token_with_hash


class PasswordResetService:
    def __init__(
        self,
        db: AsyncSession,
        token_repository: PasswordResetTokenRepository,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
        audit_service: AuditService,
        email_service: EmailService,
        user_session_repository: UserSessionRepository,
    ) -> None:
        self._db = db
        self._token_repository = token_repository
        self._user_repository = user_repository
        self._refresh_token_repository = refresh_token_repository
        self._audit_service = audit_service
        self._email_service = email_service
        self._user_session_repository = user_session_repository

    async def request_reset(
        self,
        *,
        email: str,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        """Always completes successfully from the caller's perspective - never
        reveals whether the email is registered.
        """
        user = await self._user_repository.get_by_email(email)
        if user is None or user.is_deleted or not user.is_active:
            await self._audit_service.log(
                user_id=None,
                action=AuditAction.PASSWORD_RESET_REQUESTED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Password reset requested for an unknown or ineligible email.",
            )
            return

        raw_token, token_hash_value, expires_at = new_token_with_hash(
            expires_in=timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
        )
        await self._token_repository.invalidate_unused_for_user(user.id)
        await self._token_repository.create(
            user_id=user.id, token_hash=token_hash_value, expires_at=expires_at
        )
        await self._email_service.send_password_reset_email(
            to_email=user.email, full_name=user.full_name, token=raw_token
        )

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.PASSWORD_RESET_REQUESTED,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="Password reset token issued.",
        )

    async def reset_password(
        self,
        *,
        token: str,
        new_password: str,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        token_hash_value = hash_token(token)
        stored = await self._token_repository.get_by_token_hash(token_hash_value)

        if stored is None or stored.is_used:
            await self._audit_service.log(
                user_id=stored.user_id if stored is not None else None,
                action=AuditAction.PASSWORD_RESET_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Password reset token is invalid or already used.",
            )
            await self._db.commit()
            raise PasswordResetTokenInvalidException()

        expires_at = as_aware_utc(stored.expires_at)
        if expires_at is not None and expires_at < utc_now():
            await self._audit_service.log(
                user_id=stored.user_id,
                action=AuditAction.PASSWORD_RESET_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Password reset token has expired.",
            )
            await self._db.commit()
            raise PasswordResetTokenExpiredException()

        user = await self._user_repository.get_by_id(stored.user_id)
        if user is None:
            await self._audit_service.log(
                user_id=stored.user_id,
                action=AuditAction.PASSWORD_RESET_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Password reset token subject no longer exists.",
            )
            await self._db.commit()
            raise PasswordResetTokenInvalidException()

        if not is_strong_password(new_password):
            await self._audit_service.log(
                user_id=user.id,
                action=AuditAction.PASSWORD_RESET_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="New password does not meet strength requirements.",
            )
            await self._db.commit()
            raise WeakPasswordException()

        hashed_password = hash_password(new_password)
        await self._user_repository.update_password(user, hashed_password=hashed_password)
        await self._token_repository.mark_used(stored)
        await self._refresh_token_repository.revoke_all_for_user(user.id)
        await self._user_session_repository.revoke_all_for_user_except(user.id, except_session_id=None)

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.PASSWORD_RESET_COMPLETED,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="Password reset completed successfully.",
        )

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.SESSION_REVOKED,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="All sessions revoked due to password reset.",
        )
