import secrets

from httpx import AsyncClient

from app.middleware.security_headers import CSRF_COOKIE_NAME


async def test_safe_request_issues_csrf_cookie(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    set_cookie = response.headers.get("set-cookie", "")
    assert f"{CSRF_COOKIE_NAME}=" in set_cookie


async def test_csrf_cookie_is_not_httponly_over_plain_http(client: AsyncClient) -> None:
    # The whole double-submit mechanism requires the frontend to read this
    # cookie via JS and echo it back in a header - HttpOnly would make that
    # impossible. This is the one deliberate exception to the app's
    # blanket cookie-hardening rule (see security_headers.py).
    #
    # The test client talks to the app over plain HTTP, which is also the
    # regression case for a real bug this caught: SecurityHeadersMiddleware
    # used to force Secure onto every cookie unconditionally, and a
    # browser silently discards a Secure cookie set over a non-HTTPS
    # response - that would have made the CSRF cookie (and any other
    # cookie) vanish in local dev. Secure must be absent here, present
    # only when the connection is actually HTTPS (see
    # test_csrf_cookie_is_secure_when_forwarded_as_https below).
    response = await client.get("/health")
    set_cookie = response.headers.get("set-cookie", "")
    assert CSRF_COOKIE_NAME in set_cookie
    assert "HttpOnly" not in set_cookie
    assert "secure" not in set_cookie.lower()
    assert "samesite=strict" in set_cookie.lower()


async def test_csrf_cookie_is_secure_when_forwarded_as_https(client: AsyncClient) -> None:
    response = await client.get("/health", headers={"X-Forwarded-Proto": "https"})
    set_cookie = response.headers.get("set-cookie", "")
    assert CSRF_COOKIE_NAME in set_cookie
    assert "secure" in set_cookie.lower()
    assert "HttpOnly" not in set_cookie


async def test_bearer_only_request_without_csrf_cookie_is_unaffected(client: AsyncClient) -> None:
    # This is the app's actual traffic today: no cookies at all, auth via
    # Authorization header. CSRF enforcement must be a complete no-op here
    # - the request should reach normal auth logic (401 for bad creds),
    # never a 403 csrf_token_invalid.
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "nobody@amplivo.com", "password": "WrongPassword1"},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] != "csrf_token_invalid"


async def test_unsafe_request_with_cookie_but_no_header_is_rejected(client: AsyncClient) -> None:
    client.cookies.set(CSRF_COOKIE_NAME, "some-csrf-value")
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "nobody@amplivo.com", "password": "WrongPassword1"},
    )
    assert response.status_code == 403
    assert response.json()["error_code"] == "csrf_token_invalid"


async def test_unsafe_request_with_mismatched_cookie_and_header_is_rejected(client: AsyncClient) -> None:
    client.cookies.set(CSRF_COOKIE_NAME, "cookie-value")
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "nobody@amplivo.com", "password": "WrongPassword1"},
        headers={"X-CSRF-Token": "different-header-value"},
    )
    assert response.status_code == 403
    assert response.json()["error_code"] == "csrf_token_invalid"


async def test_unsafe_request_with_matching_cookie_and_header_passes_csrf_check(
    client: AsyncClient,
) -> None:
    token = secrets.token_urlsafe(16)
    client.cookies.set(CSRF_COOKIE_NAME, token)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "nobody@amplivo.com", "password": "WrongPassword1"},
        headers={"X-CSRF-Token": token},
    )
    # CSRF check passed - the request reached real auth logic, which then
    # correctly rejects the bogus credentials with 401, not 403.
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_credentials"


async def test_get_request_with_csrf_cookie_does_not_require_header(client: AsyncClient) -> None:
    # Safe methods are never subject to CSRF enforcement, cookie or not.
    client.cookies.set(CSRF_COOKIE_NAME, "anything")
    response = await client.get("/health")
    assert response.status_code == 200


async def test_bearer_request_with_stray_csrf_cookie_is_not_blocked(client: AsyncClient) -> None:
    # Regression test for a real bug: this middleware issues csrf_token on
    # every safe GET, and httpx.AsyncClient (like a real browser) persists
    # cookies across requests on the same client/session. That means any
    # bearer-authenticated caller that ever made one prior GET - e.g. this
    # app's actual frontend calling GET /api/v1/auth/sessions - would pick
    # up the cookie and then get 403'd on its very next unsafe request,
    # even though it was never CSRF-vulnerable (bearer auth, not cookies)
    # and has no idea X-CSRF-Token exists. Caught via
    # test_sessions.py::test_logout_specific_session_by_id newly failing
    # with 403 after CSRFMiddleware was introduced.
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "csrf-bearer-check@amplivo.com",
            "username": "csrf_bearer_check",
            "full_name": "CSRF Bearer Check",
            "password": "SecurePass123",
        },
    )
    assert register_response.status_code == 201

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "csrf-bearer-check@amplivo.com", "password": "SecurePass123"},
    )
    tokens = login_response.json()
    auth_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    # A prior safe GET on this same client picks up the csrf_token cookie -
    # exactly like a real page load calling GET /api/v1/auth/me.
    me_response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_response.status_code == 200
    assert f"{CSRF_COOKIE_NAME}=" in me_response.headers.get("set-cookie", "")

    # The client now silently carries that cookie (httpx's cookie jar, like
    # a browser) into this unsafe bearer-authenticated request, with no
    # X-CSRF-Token header - must not be blocked.
    logout_response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers=auth_headers,
    )
    assert logout_response.status_code == 200
    assert logout_response.json().get("error_code") != "csrf_token_invalid"
