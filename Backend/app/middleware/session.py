from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.exceptions import AppException
from app.utils.jwt import decode_token


class SessionMiddleware(BaseHTTPMiddleware):
    """Resolves the session_id claim from a bearer access token, when
    present, and attaches it to request.state.session_id - enabling
    "terminate my current session" endpoints to identify the caller's
    session from the access token alone, without requiring the client to
    resend its refresh token. Decode-only, no DB access, never rejects the
    request itself - mirrors AuthenticationMiddleware exactly.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request.state.session_id = None
        authorization = request.headers.get("Authorization")
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            try:
                payload = decode_token(token, expected_type="access")
                request.state.session_id = payload.get("session_id")
            except AppException:
                request.state.session_id = None
        return await call_next(request)
