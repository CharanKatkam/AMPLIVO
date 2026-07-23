from datetime import timedelta

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification_token import EmailVerificationToken
from app.models.password_reset_token import PasswordResetToken
from app.services.email_service import get_outbox
from app.services.token_cleanup_service import TokenCleanupService
from app.utils.time import utc_now

PAYLOAD = {
    "email": "cleanup.user@amplivo.com",
    "username": "cleanup_user",
    "full_name": "Cleanup User",
    "password": "SecurePass123",
}


async def _register(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json=PAYLOAD)
    assert response.status_code == 201


async def test_cleanup_deletes_expired_verification_tokens(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)

    result = await db_session.execute(select(EmailVerificationToken))
    token = result.scalar_one()
    token.expires_at = utc_now() - timedelta(days=1)
    await db_session.commit()

    service = TokenCleanupService(db_session)
    stats = await service.run()
    assert stats["verification_tokens_deleted"] == 1

    result = await db_session.execute(select(EmailVerificationToken))
    assert list(result.scalars()) == []


async def test_cleanup_deletes_expired_password_reset_tokens(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    assert get_outbox()

    result = await db_session.execute(select(PasswordResetToken))
    token = result.scalar_one()
    token.expires_at = utc_now() - timedelta(minutes=1)
    await db_session.commit()

    service = TokenCleanupService(db_session)
    stats = await service.run()
    assert stats["password_reset_tokens_deleted"] == 1

    result = await db_session.execute(select(PasswordResetToken))
    assert list(result.scalars()) == []


async def test_cleanup_keeps_non_expired_tokens(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register(client)

    service = TokenCleanupService(db_session)
    stats = await service.run()
    assert stats["verification_tokens_deleted"] == 0

    result = await db_session.execute(select(EmailVerificationToken))
    assert len(list(result.scalars())) == 1
