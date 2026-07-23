from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    EmailAlreadyVerifiedException,
    VerificationTokenExpiredException,
    VerificationTokenInvalidException,
)
from app.models.audit_log import AuditAction, AuditStatus
from app.models.user import User
from app.repositories.email_verification_token_repository import EmailVerificationTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService
from app.services.email_service import EmailService
from app.utils.request_context import ClientContext
from app.utils.time import as_aware_utc, utc_now
from app.utils.tokens import hash_token, new_token_with_hash


class EmailVerificationService:
    def __init__(
        self,
        db: AsyncSession,
        token_repository: EmailVerificationTokenRepository,
        user_repository: UserRepository,
        audit_service: AuditService,
        email_service: EmailService,
    ) -> None:
        self._db = db
        self._token_repository = token_repository
        self._user_repository = user_repository
        self._audit_service = audit_service
        self._email_service = email_service

    async def send_verification_email(
        self,
        user: User,
        *,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        if user.is_verified:
            raise EmailAlreadyVerifiedException()

        raw_token, token_hash_value, expires_at = new_token_with_hash(
            expires_in=timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
        )
        await self._token_repository.invalidate_unused_for_user(user.id)
        await self._token_repository.create(
            user_id=user.id, token_hash=token_hash_value, expires_at=expires_at
        )
        await self._email_service.send_verification_email(
            to_email=user.email, full_name=user.full_name, token=raw_token
        )

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.VERIFICATION_EMAIL_SENT,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="Verification email sent.",
        )

    async def resend_verification_by_email(
        self,
        email: str,
        *,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> None:
        """Always completes silently from the caller's perspective - mirrors
        the forgot-password pattern so this endpoint cannot be used to
        enumerate registered or already-verified emails.
        """
        user = await self._user_repository.get_by_email(email)
        if user is None or user.is_deleted or user.is_verified:
            return
        await self.send_verification_email(
            user, endpoint=endpoint, request_method=request_method, client_context=client_context
        )

    async def verify_email(
        self,
        *,
        token: str,
        endpoint: str,
        request_method: str,
        client_context: ClientContext,
    ) -> User:
        token_hash_value = hash_token(token)
        stored = await self._token_repository.get_by_token_hash(token_hash_value)

        if stored is None or stored.is_used:
            await self._audit_service.log(
                user_id=stored.user_id if stored is not None else None,
                action=AuditAction.VERIFICATION_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Verification token is invalid or already used.",
            )
            await self._db.commit()
            raise VerificationTokenInvalidException()

        expires_at = as_aware_utc(stored.expires_at)
        if expires_at is not None and expires_at < utc_now():
            await self._audit_service.log(
                user_id=stored.user_id,
                action=AuditAction.VERIFICATION_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Verification token has expired.",
            )
            await self._db.commit()
            raise VerificationTokenExpiredException()

        user = await self._user_repository.get_by_id(stored.user_id)
        if user is None:
            await self._audit_service.log(
                user_id=stored.user_id,
                action=AuditAction.VERIFICATION_FAILED,
                endpoint=endpoint,
                request_method=request_method,
                client_context=client_context,
                status=AuditStatus.FAILURE,
                message="Verification token subject no longer exists.",
            )
            await self._db.commit()
            raise VerificationTokenInvalidException()

        await self._user_repository.mark_verified(user)
        await self._token_repository.mark_used(stored)

        await self._audit_service.log(
            user_id=user.id,
            action=AuditAction.VERIFICATION_SUCCESS,
            endpoint=endpoint,
            request_method=request_method,
            client_context=client_context,
            status=AuditStatus.SUCCESS,
            message="Email verified successfully.",
        )

        return user
