from httpx import AsyncClient

from app.core.config import settings

_EXPECTED_HEADERS = {
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=(), microphone=(), camera=()",
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
}


async def test_response_includes_security_headers(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    for header, value in _EXPECTED_HEADERS.items():
        assert response.headers.get(header) == value


async def test_security_headers_present_on_error_response(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
    for header, value in _EXPECTED_HEADERS.items():
        assert response.headers.get(header) == value


async def test_security_headers_present_on_rate_limited_response(client: AsyncClient) -> None:
    payload = {"identifier": "nobody@amplivo.com", "password": "WrongPassword1"}
    for _ in range(settings.RATE_LIMIT_LOGIN_PER_MINUTE):
        await client.post("/api/v1/auth/login", json=payload)

    limited_response = await client.post("/api/v1/auth/login", json=payload)
    assert limited_response.status_code == 429
    for header, value in _EXPECTED_HEADERS.items():
        assert limited_response.headers.get(header) == value
