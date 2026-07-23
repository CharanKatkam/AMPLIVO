from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.email_verification_token_repository import EmailVerificationTokenRepository
from app.repositories.login_history_repository import LoginHistoryRepository
from app.repositories.password_reset_token_repository import PasswordResetTokenRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.repositories.user_session_repository import UserSessionRepository
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.services.email_verification_service import EmailVerificationService
from app.services.geolocation_service import GeoLocationService
from app.services.password_reset_service import PasswordResetService
from app.services.session_service import SessionService
from app.services.user_service import UserService


def get_audit_service(db: AsyncSession = Depends(get_db)) -> AuditService:
    return AuditService(AuditLogRepository(db))


def get_email_service() -> EmailService:
    return EmailService()


def get_geolocation_service() -> GeoLocationService:
    return GeoLocationService()


def get_session_service(
    db: AsyncSession = Depends(get_db),
    audit_service: AuditService = Depends(get_audit_service),
) -> SessionService:
    return SessionService(db, UserSessionRepository(db), RefreshTokenRepository(db), audit_service)


def get_email_verification_service(
    db: AsyncSession = Depends(get_db),
    audit_service: AuditService = Depends(get_audit_service),
    email_service: EmailService = Depends(get_email_service),
) -> EmailVerificationService:
    return EmailVerificationService(
        db,
        EmailVerificationTokenRepository(db),
        UserRepository(db),
        audit_service,
        email_service,
    )


def get_password_reset_service(
    db: AsyncSession = Depends(get_db),
    audit_service: AuditService = Depends(get_audit_service),
    email_service: EmailService = Depends(get_email_service),
) -> PasswordResetService:
    return PasswordResetService(
        db,
        PasswordResetTokenRepository(db),
        UserRepository(db),
        RefreshTokenRepository(db),
        audit_service,
        email_service,
        UserSessionRepository(db),
    )


def get_user_service(
    db: AsyncSession = Depends(get_db),
    audit_service: AuditService = Depends(get_audit_service),
    email_verification_service: EmailVerificationService = Depends(get_email_verification_service),
) -> UserService:
    return UserService(UserRepository(db), audit_service, email_verification_service)


def get_auth_service(
    db: AsyncSession = Depends(get_db),
    audit_service: AuditService = Depends(get_audit_service),
    geolocation_service: GeoLocationService = Depends(get_geolocation_service),
) -> AuthService:
    return AuthService(
        db,
        UserRepository(db),
        RefreshTokenRepository(db),
        LoginHistoryRepository(db),
        audit_service,
        UserSessionRepository(db),
        geolocation_service,
    )
