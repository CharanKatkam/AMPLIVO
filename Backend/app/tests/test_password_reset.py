from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditAction, AuditLog
from app.models.password_reset_token import PasswordResetToken
from app.services.email_service import get_outbox
from app.utils.time import utc_now

PAYLOAD = {
    "email": "reset.user@amplivo.com",
    "username": "reset_user",
    "full_name": "Reset User",
    "password": "OldSecure123",
}

STRONG_NEW_PASSWORD = "NewSecure!Pass1"


async def _register(client: AsyncClient) -> dict:
    response = await client.post("/api/v1/auth/register", json=PAYLOAD)
    assert response.status_code == 201
    return response.json()


async def _login(client: AsyncClient, password: str | None = None) -> dict:
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": password or PAYLOAD["password"]},
    )
    assert response.status_code == 200
    return response.json()


def _latest_reset_token() -> str:
    outbox = get_outbox()
    assert outbox, "expected at least one email to have been sent"
    return outbox[-1].token


async def test_forgot_password_existing_email_returns_generic_message(client: AsyncClient) -> None:
    await _register(client)
    response = await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    assert response.status_code == 200
    assert "password reset instructions" in response.json()["message"].lower()


async def test_forgot_password_unknown_email_returns_identical_response(client: AsyncClient) -> None:
    await _register(client)
    known = await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    unknown = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "ghost@amplivo.com"}
    )
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()


async def test_forgot_password_creates_reset_token_for_existing_user(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    response = await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    assert response.status_code == 200

    result = await db_session.execute(select(PasswordResetToken))
    tokens = list(result.scalars())
    assert len(tokens) == 1
    assert tokens[0].is_used is False


async def test_forgot_password_does_not_create_token_for_unknown_email(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    response = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "ghost@amplivo.com"}
    )
    assert response.status_code == 200

    result = await db_session.execute(select(PasswordResetToken))
    assert list(result.scalars()) == []
    assert not get_outbox()


async def test_reset_password_success(client: AsyncClient) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": STRONG_NEW_PASSWORD},
    )
    assert response.status_code == 200

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": STRONG_NEW_PASSWORD},
    )
    assert login_response.status_code == 200


async def test_reset_password_old_password_no_longer_works(client: AsyncClient) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()

    await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": STRONG_NEW_PASSWORD},
    )

    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_credentials"


async def test_reset_password_invalidates_all_refresh_tokens(client: AsyncClient) -> None:
    await _register(client)
    login_tokens = await _login(client)
    old_refresh_token = login_tokens["refresh_token"]

    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    reset_token = _latest_reset_token()
    await client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": STRONG_NEW_PASSWORD},
    )

    refresh_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh_token}
    )
    assert refresh_response.status_code == 401
    assert refresh_response.json()["error_code"] == "token_revoked"


async def test_reset_password_expired_token_rejected(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()

    result = await db_session.execute(select(PasswordResetToken))
    stored = result.scalar_one()
    stored.expires_at = utc_now().replace(year=2000)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": STRONG_NEW_PASSWORD},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "password_reset_token_expired"


async def test_reset_password_already_used_token_rejected(client: AsyncClient) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()

    first = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": STRONG_NEW_PASSWORD},
    )
    assert first.status_code == 200

    second = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "AnotherStrong!Pass9"},
    )
    assert second.status_code == 401
    assert second.json()["error_code"] == "password_reset_token_invalid"


async def test_reset_password_invalid_token_rejected(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "totally-made-up-token-value", "new_password": STRONG_NEW_PASSWORD},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "password_reset_token_invalid"


async def test_reset_password_weak_password_rejected(client: AsyncClient) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "alllowercase1"},
    )
    assert response.status_code == 400
    assert response.json()["error_code"] == "weak_password"


async def test_forgot_password_invalidates_previous_reset_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    first_token = _latest_reset_token()

    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    second_token = _latest_reset_token()
    assert second_token != first_token

    stale_attempt = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": first_token, "new_password": STRONG_NEW_PASSWORD},
    )
    assert stale_attempt.status_code == 401
    assert stale_attempt.json()["error_code"] == "password_reset_token_invalid"

    fresh_attempt = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": second_token, "new_password": STRONG_NEW_PASSWORD},
    )
    assert fresh_attempt.status_code == 200


async def test_password_reset_audit_logs_created(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    await client.post("/api/v1/auth/forgot-password", json={"email": PAYLOAD["email"]})
    token = _latest_reset_token()
    await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": STRONG_NEW_PASSWORD},
    )

    result = await db_session.execute(
        select(AuditLog).where(AuditLog.action == AuditAction.PASSWORD_RESET_REQUESTED.value)
    )
    assert len(list(result.scalars())) == 1

    result = await db_session.execute(
        select(AuditLog).where(AuditLog.action == AuditAction.PASSWORD_RESET_COMPLETED.value)
    )
    assert len(list(result.scalars())) == 1


async def test_password_reset_failed_audit_log_on_invalid_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "garbage-token-value-here", "new_password": STRONG_NEW_PASSWORD},
    )

    result = await db_session.execute(
        select(AuditLog).where(AuditLog.action == AuditAction.PASSWORD_RESET_FAILED.value)
    )
    assert len(list(result.scalars())) == 1
