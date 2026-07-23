from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken

PAYLOAD = {
    "email": "device.user@amplivo.com",
    "username": "device_user",
    "full_name": "Device User",
    "password": "SecurePass123",
}

FIREFOX_LINUX_UA = "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0"


async def _register(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json=PAYLOAD)
    assert response.status_code == 201


async def test_login_records_device_metadata_on_refresh_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
        headers={"User-Agent": FIREFOX_LINUX_UA},
    )
    assert response.status_code == 200

    result = await db_session.execute(select(RefreshToken))
    token = result.scalar_one()
    assert token.browser == "Firefox"
    assert token.operating_system == "Linux"
    assert token.device_name == "Desktop"
    assert token.user_agent == FIREFOX_LINUX_UA
    assert token.last_used is not None
    assert token.ip_address is not None


async def test_refresh_updates_last_used_and_rotates_device_metadata(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await _register(client)
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": PAYLOAD["email"], "password": PAYLOAD["password"]},
        headers={"User-Agent": FIREFOX_LINUX_UA},
    )
    old_refresh_token = login_response.json()["refresh_token"]

    result = await db_session.execute(select(RefreshToken))
    old_token_row = result.scalar_one()
    assert old_token_row.last_used is not None
    assert old_token_row.is_revoked is False

    mobile_ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
    refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
        headers={"User-Agent": mobile_ua},
    )
    assert refresh_response.status_code == 200

    db_session.expire_all()
    result = await db_session.execute(select(RefreshToken).order_by(RefreshToken.created_at))
    tokens = list(result.scalars())
    assert len(tokens) == 2

    old_token_after = next(t for t in tokens if t.id == old_token_row.id)
    assert old_token_after.is_revoked is True

    new_token = next(t for t in tokens if t.id != old_token_row.id)
    assert new_token.device_name == "Mobile"
    assert new_token.operating_system == "iOS"
