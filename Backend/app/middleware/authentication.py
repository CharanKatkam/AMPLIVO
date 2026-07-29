from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.exceptions import AppException
from app.utils.jwt import decode_token


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Resolves the caller's user id from a bearer access token, when present,
    and attaches it to request.state.user_id for downstream use (e.g. audit
    logging). It never rejects a request itself - route-level dependencies
    (see app.dependencies.auth.get_current_user) are what enforce authentication
    on protected endpoints.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request.state.user_id = None
        authorization = request.headers.get("Authorization")
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            try:
                payload = decode_token(token, expected_type="access")
                request.state.user_id = payload.get("sub")
            except AppException:
                request.state.user_id = None
        return await call_next(request)
