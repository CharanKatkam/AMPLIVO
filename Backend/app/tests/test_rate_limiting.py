from httpx import AsyncClient

from app.core.config import settings


async def test_login_rate_limit_returns_429_after_limit(client: AsyncClient) -> None:
    payload = {"identifier": "nobody@amplivo.com", "password": "WrongPassword1"}

    for _ in range(settings.RATE_LIMIT_LOGIN_PER_MINUTE):
        response = await client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 401

    limited_response = await client.post("/api/v1/auth/login", json=payload)
    assert limited_response.status_code == 429
    assert limited_response.json()["error_code"] == "rate_limit_exceeded"


async def test_register_rate_limit_returns_429_after_limit(client: AsyncClient) -> None:
    for i in range(settings.RATE_LIMIT_REGISTER_PER_MINUTE):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": f"burst{i}@amplivo.com",
                "username": f"burst_user_{i}",
                "full_name": "Burst User",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == 201

    limited_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "overflow@amplivo.com",
            "username": "overflow_user",
            "full_name": "Overflow User",
            "password": "SecurePass123",
        },
    )
    assert limited_response.status_code == 429
    assert limited_response.json()["error_code"] == "rate_limit_exceeded"


async def test_refresh_rate_limit_returns_429_after_limit(client: AsyncClient) -> None:
    for _ in range(settings.RATE_LIMIT_REFRESH_PER_MINUTE):
        response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage-token"})
        assert response.status_code == 401

    limited_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": "garbage-token"}
    )
    assert limited_response.status_code == 429


async def test_rate_limit_is_scoped_per_endpoint(client: AsyncClient) -> None:
    for i in range(settings.RATE_LIMIT_REGISTER_PER_MINUTE):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": f"scoped{i}@amplivo.com",
                "username": f"scoped_user_{i}",
                "full_name": "Scoped User",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == 201

    # Register is now exhausted, but login (a different bucket) must still work.
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "scoped0@amplivo.com", "password": "SecurePass123"},
    )
    assert login_response.status_code == 200
