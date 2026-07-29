from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.utils.request_context import get_client_context


class AuditMiddleware(BaseHTTPMiddleware):
    """Computes IP/device/browser/OS context once per request and caches it on
    request.state.client_context, so route handlers, dependencies (e.g. the
    invalid-token audit trail in get_current_user), and services all see the
    same values without re-parsing the User-Agent header repeatedly.

    Actual audit_logs rows are written by the service layer, which has the
    business context (why an action failed) that a generic middleware does
    not - this middleware's job is strictly context capture, not persistence.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request.state.client_context = get_client_context(request)
        return await call_next(request)
