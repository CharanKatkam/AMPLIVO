from httpx import AsyncClient

from app.core.config import settings
from app.middleware.security_headers import _harden_cookie

_EXPECTED_HEADERS = {
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "0",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": (
        "geolocation=(), microphone=(), camera=(), payment=(), usb=(), "
        "magnetometer=(), gyroscope=(), accelerometer=()"
    ),
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


async def test_docs_get_relaxed_csp_not_default_csp(client: AsyncClient) -> None:
    response = await client.get("/api/v1/docs")
    assert response.status_code == 200
    csp = response.headers.get("content-security-policy")
    assert csp != _EXPECTED_HEADERS["content-security-policy"]
    assert "cdn.jsdelivr.net" in csp
    assert "frame-ancestors 'none'" in csp
    # every other security header still applies unchanged on the docs route
    for header, value in _EXPECTED_HEADERS.items():
        if header == "content-security-policy":
            continue
        assert response.headers.get(header) == value


async def test_no_x_powered_by_header(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert "x-powered-by" not in response.headers


async def test_hsts_absent_on_plain_http_request(client: AsyncClient) -> None:
    # The test client talks to the app over plain HTTP with no
    # X-Forwarded-Proto - OWASP guidance is to never send HSTS on a
    # connection the browser doesn't see as HTTPS, since the browser must
    # ignore it there anyway.
    response = await client.get("/health")
    assert "strict-transport-security" not in response.headers


async def test_hsts_present_when_forwarded_as_https(client: AsyncClient) -> None:
    # Render (and most PaaS hosts) terminate TLS at the edge and forward
    # plain HTTP internally, signaling the original scheme via
    # X-Forwarded-Proto - this is what a real production request looks like.
    response = await client.get("/health", headers={"X-Forwarded-Proto": "https"})
    assert response.headers.get("strict-transport-security") == "max-age=31536000; includeSubDomains"


def test_harden_cookie_adds_missing_flags() -> None:
    hardened = _harden_cookie("session_id=abc123; Path=/", is_secure=True)
    attrs = {p.strip().lower() for p in hardened.split(";")[1:]}
    assert "secure" in attrs
    assert "httponly" in attrs
    assert "samesite=lax" in attrs


def test_harden_cookie_preserves_explicit_flags() -> None:
    # A cookie that already declares SameSite=Strict must keep that value,
    # not be downgraded to the Lax default.
    hardened = _harden_cookie("session_id=abc123; Path=/; SameSite=Strict", is_secure=True)
    attrs_lower = hardened.lower()
    assert "samesite=strict" in attrs_lower
    assert attrs_lower.count("samesite=") == 1
    assert "secure" in attrs_lower
    assert "httponly" in attrs_lower


def test_harden_cookie_is_case_insensitive_to_existing_attrs() -> None:
    # A cookie that already spells the flags in a different case must not
    # get duplicate attributes appended.
    hardened = _harden_cookie("session_id=abc123; SECURE; HttpOnly; SameSite=None", is_secure=True)
    assert hardened.lower().count("secure") == 1
    assert hardened.lower().count("httponly") == 1
    assert hardened.lower().count("samesite=") == 1


def test_harden_cookie_does_not_force_secure_over_plain_http() -> None:
    # A browser silently discards any Set-Cookie carrying Secure when the
    # response wasn't served over HTTPS - forcing it unconditionally would
    # make the cookie vanish instead of hardening it, breaking things like
    # the CSRF cookie in local/non-TLS dev.
    hardened = _harden_cookie("session_id=abc123; Path=/", is_secure=False)
    assert "secure" not in hardened.lower()
    assert "httponly" in hardened.lower()
    assert "samesite=lax" in hardened.lower()


def test_harden_cookie_preserves_explicit_secure_even_when_not_is_secure() -> None:
    # If the route explicitly opted into Secure itself, that's not this
    # function's call to reverse.
    hardened = _harden_cookie("session_id=abc123; Secure", is_secure=False)
    assert "secure" in hardened.lower()
