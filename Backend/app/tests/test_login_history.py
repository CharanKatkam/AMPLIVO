from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.login_history import LoginHistory, LoginHistoryStatus

PAYLOAD = {
    "email": "history.user@amplivo.com",
    "username": "history_user",
    "full_name": "History User",
    "password": "SecurePass123",
}


async def _register(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json=PAYLOAD)
    assert response.status_code == 201


async def _login(client: AsyncClient) -> dict:
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
    )
    assert response.status_code == 200
    return response.json()


async def test_login_creates_login_history_entry(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    await _login(client)

    result = await db_session.execute(select(LoginHistory))
    entries = list(result.scalars())
    assert len(entries) == 1
    entry = entries[0]
    assert entry.status == LoginHistoryStatus.ACTIVE.value
    assert entry.logout_time is None
    assert entry.refresh_token_id is not None
    assert entry.login_time is not None


async def test_logout_closes_login_history_entry(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    tokens = await _login(client)

    logout_response = await client.post(
        "/api/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]}
    )
    assert logout_response.status_code == 200

    result = await db_session.execute(select(LoginHistory))
    entry = result.scalar_one()
    assert entry.status == LoginHistoryStatus.LOGGED_OUT.value
    assert entry.logout_time is not None


async def test_refresh_reassigns_login_history_to_new_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    tokens = await _login(client)

    result = await db_session.execute(select(LoginHistory))
    entry_before = result.scalar_one()
    original_refresh_token_id = entry_before.refresh_token_id

    refresh_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refresh_response.status_code == 200

    db_session.expire_all()
    result = await db_session.execute(select(LoginHistory))
    entries = list(result.scalars())
    assert len(entries) == 1
    entry_after = entries[0]
    assert entry_after.status == LoginHistoryStatus.ACTIVE.value
    assert entry_after.refresh_token_id != original_refresh_token_id
    assert entry_after.id == entry_before.id


async def test_login_history_records_device_info(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        },
    )
    assert response.status_code == 200

    result = await db_session.execute(select(LoginHistory))
    entry = result.scalar_one()
    assert entry.browser == "Chrome"
    assert entry.operating_system == "Windows"
    assert entry.device == "Desktop"
