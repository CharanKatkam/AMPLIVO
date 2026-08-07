import asyncio
import math
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
    """Fixed-window, in-memory rate limiter keyed by (bucket, client IP).

    In-memory state means limits are per-process, not shared across multiple
    workers/instances - adequate for a single-instance deployment; a
    distributed deployment should back this with Redis instead.

    Two tiers are enforced, in this order, both independently:
      1. A tighter per-path rule for specific abuse-prone endpoints (login,
         register, refresh, the public contact/consultation forms).
      2. A general per-IP ceiling applied to every /api/v1 request as a
         volumetric baseline for the remaining ~440 routes that have no
         endpoint-specific rule ("API rate limiting").
    A request only needs to trip one tier to be rejected with 429 - a
    rejected request is never double-counted against the other tier.
    """

    def __init__(
        self,
        app: ASGIApp,
        rules: dict[str, RateLimitRule] | None = None,
        default_rule: RateLimitRule | None = None,
    ) -> None:
        super().__init__(app)
        self._rules = rules or {
            f"{settings.API_V1_PREFIX}/auth/login": RateLimitRule(limit=settings.RATE_LIMIT_LOGIN_PER_MINUTE),
            f"{settings.API_V1_PREFIX}/auth/register": RateLimitRule(
                limit=settings.RATE_LIMIT_REGISTER_PER_MINUTE
            ),
            f"{settings.API_V1_PREFIX}/auth/refresh": RateLimitRule(
                limit=settings.RATE_LIMIT_REFRESH_PER_MINUTE
            ),
            f"{settings.API_V1_PREFIX}/contact-submissions": RateLimitRule(
                limit=settings.RATE_LIMIT_FORM_SUBMISSION_PER_MINUTE
            ),
            f"{settings.API_V1_PREFIX}/consultation-requests": RateLimitRule(
                limit=settings.RATE_LIMIT_FORM_SUBMISSION_PER_MINUTE
            ),
        }
        self._default_rule = default_rule or RateLimitRule(limit=settings.RATE_LIMIT_DEFAULT_PER_MINUTE)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = get_client_ip(request) or "unknown"

        # Check for dynamic path prefix matches if full path doesn't strictly match a specific rule
        matched_rule = self._rules.get(request.url.path)
        if not matched_rule:
            if request.url.path.startswith(f"{settings.API_V1_PREFIX}/analytics"):
                matched_rule = RateLimitRule(limit=settings.RATE_LIMIT_DEFAULT_PER_MINUTE, window_seconds=60)
            elif request.url.path.startswith(f"{settings.API_V1_PREFIX}/clients"):
                matched_rule = RateLimitRule(limit=5, window_seconds=60)

        if matched_rule is not None:
            retry_after = await self._check(f"path:{request.url.path}", client_ip, matched_rule)
            if retry_after is not None:
                return error_response(RateLimitException(retry_after=retry_after), request)

        if request.url.path.startswith(settings.API_V1_PREFIX):
            retry_after = await self._check("global", client_ip, self._default_rule)
            if retry_after is not None:
                return error_response(RateLimitException(retry_after=retry_after), request)

        return await call_next(request)

    @staticmethod
    async def _check(bucket: str, client_ip: str, rule: RateLimitRule) -> int | None:
        """Registers a hit against (bucket, client_ip) under rule.

        Returns None if the request is allowed. Returns the number of
        seconds the caller should wait before retrying (for the
        Retry-After header) if the rule's limit has been reached.
        """
        key = (bucket, client_ip)
        now = time.monotonic()
        async with _lock:
            timestamps = [t for t in _hits.get(key, []) if now - t < rule.window_seconds]
            if len(timestamps) >= rule.limit:
                _hits[key] = timestamps
                oldest = timestamps[0]
                return max(1, math.ceil(rule.window_seconds - (now - oldest)))
            timestamps.append(now)
            _hits[key] = timestamps
            return None
