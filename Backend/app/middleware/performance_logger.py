"""Request-duration logging middleware.

Logs every request with method, path, status, duration, and — where
available — the authenticated user ID and correlation ID.

This sits near the outer edge of the middleware stack so the timings
reflect the full request pipeline, including all inner middleware.
"""

from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.performance")


class PerformanceLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000

        correlation_id = getattr(request.state, "correlation_id", None)
        user_id = getattr(request.state, "user_id", None)

        extra = {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "correlation_id": correlation_id,
        }
        if user_id:
            extra["user_id"] = str(user_id)

        if response.status_code >= 500:
            logger.warning("Slow or errored request", extra=extra)
        elif duration_ms > 1000:
            logger.info("Slow request", extra=extra)
        else:
            logger.debug("Request completed", extra=extra)

        return response
