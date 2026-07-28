from httpx import AsyncClient

from app.core.config import settings


def test_wildcard_origin_is_never_configured() -> None:
    assert "*" not in settings.cors_origins_list


async def test_preflight_options_request_from_allowed_origin_succeeds(client: AsyncClient) -> None:
    origin = settings.cors_origins_list[0]
    response = await client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    for method in ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"):
        assert method in response.headers.get("access-control-allow-methods", "")


async def test_preflight_options_request_from_disallowed_origin_is_rejected(client: AsyncClient) -> None:
    response = await client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


async def test_preflight_does_not_reach_rate_limiter_or_auth(client: AsyncClient) -> None:
    # A CORS preflight must be answered by CORSMiddleware itself before it
    # ever reaches RateLimiterMiddleware or route logic - repeated preflight
    # calls to the login route must never 429, and must never require a
    # body/credentials.
    origin = settings.cors_origins_list[0]
    for _ in range(settings.RATE_LIMIT_LOGIN_PER_MINUTE + 5):
        response = await client.options(
            "/api/v1/auth/login",
            headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
        )
        assert response.status_code == 200


async def test_allowed_origin_is_reflected_on_actual_request(client: AsyncClient) -> None:
    origin = settings.cors_origins_list[0]
    response = await client.get("/health", headers={"Origin": origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") == "true"


async def test_disallowed_origin_is_not_reflected_on_actual_request(client: AsyncClient) -> None:
    # The server doesn't block the request outright - CORS is enforced by
    # the browser refusing to expose the response to page JS when the
    # Access-Control-Allow-Origin header is absent/mismatched.
    response = await client.get("/health", headers={"Origin": "https://evil.example.com"})
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
