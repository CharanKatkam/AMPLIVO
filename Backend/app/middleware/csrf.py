import secrets

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.exceptions import CSRFException
from app.middleware.exception_handler import error_response
from app.middleware.security_headers import CSRF_COOKIE_NAME, is_secure_request

CSRF_HEADER_NAME = "X-CSRF-Token"
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


class CSRFMiddleware(BaseHTTPMiddleware):
    """Double-submit-cookie CSRF protection.

    This API authenticates with a bearer JWT in the Authorization header
    (app/middleware/authentication.py), never a cookie - browsers don't
    attach that header automatically to a cross-site request, so bearer-only
    traffic is already CSRF-immune by construction (OWASP's CSRF cheat sheet
    treats a custom-header token as sufficient protection on its own, no
    separate CSRF token needed). This middleware is the layer for the
    cookie-based case: if a request carries a csrf_token cookie at all, an
    unsafe request must echo that exact value back in the X-CSRF-Token
    header or it's rejected. A cross-origin attacker page can make the
    browser send the cookie automatically, but same-origin policy stops it
    from reading the cookie's value to also set the matching header - that
    mismatch is what double-submit actually detects.

    Every safe (GET/HEAD/OPTIONS/TRACE) request that doesn't already have
    the cookie gets issued one, so a frontend page can read it via
    document.cookie and start sending the header on its next unsafe
    request - this is what makes it AJAX-compatible without a dedicated
    "fetch me a token" endpoint.

    Critical interaction the first version of this file got wrong: issuing
    that cookie on every safe request means a browser (or a test client
    reusing one httpx.AsyncClient/cookie-jar) that ever made so much as one
    GET ends up holding a csrf_token cookie regardless of how it
    authenticates - and this app's actual frontend authenticates purely via
    bearer token and has no idea this header exists. Enforcing the
    double-submit check just because that incidental cookie is present
    would 403 every real mutating request from day one. The fix: only
    enforce when the request is NOT already carrying a bearer token - a
    valid or even garbage bearer token still proves the caller isn't a
    naive cross-site form/img/script forgery (those can't set arbitrary
    headers), so it's exactly the "already CSRF-immune" case from the
    paragraph above. See test_csrf.py's
    test_bearer_request_with_stray_csrf_cookie_is_not_blocked for the
    regression this closes.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        cookie_token = request.cookies.get(CSRF_COOKIE_NAME)
        has_bearer_auth = request.headers.get("authorization", "").lower().startswith("bearer ")

        if request.method not in _SAFE_METHODS and cookie_token is not None and not has_bearer_auth:
            header_token = request.headers.get(CSRF_HEADER_NAME)
            if not header_token or not secrets.compare_digest(header_token, cookie_token):
                return error_response(CSRFException())

        response = await call_next(request)

        if cookie_token is None and request.method in _SAFE_METHODS:
            response.set_cookie(
                key=CSRF_COOKIE_NAME,
                value=secrets.token_urlsafe(32),
                httponly=False,  # must be JS-readable so the frontend can echo it back
                secure=is_secure_request(request),
                samesite="strict",
                path="/",
            )

        return response
