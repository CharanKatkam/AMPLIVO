"""Request-ID and correlation-ID middleware.

Every HTTP response carries a ``X-Request-ID`` header.  If the caller sends
a ``X-Correlation-ID`` header, it is propagated through logs and downstream
calls; otherwise a UUID is generated for the request.
"""

from __future__ import annotations

import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attaches ``X-Request-ID`` to every response and stores both the
    request ID and the correlation ID on ``request.state`` for downstream
    middleware, route handlers, and the JSON logging formatter to consume."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())
        correlation_id = request.headers.get("X-Correlation-ID") or request_id

        request.state.request_id = request_id
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        if correlation_id:
            response.headers["X-Correlation-ID"] = correlation_id
        return response
