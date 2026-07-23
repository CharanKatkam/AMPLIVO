import asyncio
import time
from dataclasses import dataclass

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.exceptions import RateLimitException
from app.middleware.exception_handler import error_response
from app.utils.request_context import get_client_ip

# Module-level (not instance-level) so tests can import reset_rate_limit_state()
# and clear state between test cases regardless of how the middleware instance
# was constructed by Starlette's lazily-built middleware stack.
_hits: dict[tuple[str, str], list[float]] = {}
_lock = asyncio.Lock()


def reset_rate_limit_state() -> None:
    _hits.clear()


@dataclass(frozen=True)
class RateLimitRule:
    limit: int
    window_seconds: int = 60


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Fixed-window, in-memory rate limiter keyed by (path, client IP).

    In-memory state means limits are per-process, not shared across multiple
    workers/instances - adequate for a single-instance deployment; a
    distributed deployment should back this with Redis instead.
    """

    def __init__(self, app: ASGIApp, rules: dict[str, RateLimitRule] | None = None) -> None:
        super().__init__(app)
        self._rules = rules or {
            f"{settings.API_V1_PREFIX}/auth/login": RateLimitRule(limit=settings.RATE_LIMIT_LOGIN_PER_MINUTE),
            f"{settings.API_V1_PREFIX}/auth/register": RateLimitRule(
                limit=settings.RATE_LIMIT_REGISTER_PER_MINUTE
            ),
            f"{settings.API_V1_PREFIX}/auth/refresh": RateLimitRule(
                limit=settings.RATE_LIMIT_REFRESH_PER_MINUTE
            ),
        }

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)
        rule = self._rules.get(request.url.path)
        if rule is None:
            return await call_next(request)

        client_ip = get_client_ip(request) or "unknown"
        key = (request.url.path, client_ip)
        now = time.monotonic()

        async with _lock:
            timestamps = [t for t in _hits.get(key, []) if now - t < rule.window_seconds]
            if len(timestamps) >= rule.limit:
                _hits[key] = timestamps
                return error_response(RateLimitException())
            timestamps.append(now)
            _hits[key] = timestamps

        return await call_next(request)
