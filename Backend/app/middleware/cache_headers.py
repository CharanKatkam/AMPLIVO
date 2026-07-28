"""Cache-Control, ETag, and conditional-response middleware.

Adds sensible cache headers to responses.  ETags are computed from the
response body for GET/HEAD responses so that clients can send
``If-None-Match`` / ``If-Modified-Since`` and receive a 304 Not Modified.

Configuration is per-path-prefix via ``cache_rules`` at construction time.
"""

from __future__ import annotations

import hashlib
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

try:
    import orjson

    def _checksum(body: bytes) -> str:
        return hashlib.sha256(body).hexdigest()[:32]

except ImportError:
    import hashlib

    def _checksum(body: bytes) -> str:
        return hashlib.sha256(body).hexdigest()[:32]


# Default cache rules: (path_prefix, cache_control_value)
# Routes not matching any prefix get "no-store" (never cache).
_DEFAULT_RULES: list[tuple[str, str]] = [
    ("/health", "no-cache, no-store, must-revalidate"),
    ("/uploads/", "public, max-age=31536000, immutable"),
    ("/api/v1/docs", "no-cache, no-store, must-revalidate"),
    ("/api/v1/openapi.json", "no-cache, no-store, must-revalidate"),
]


class CacheHeadersMiddleware(BaseHTTPMiddleware):
    """Applies Cache-Control headers and ETag-based conditional responses."""

    def __init__(
        self,
        app: ASGIApp,
        rules: list[tuple[str, str]] | None = None,
        etag_enabled: bool = True,
    ) -> None:
        super().__init__(app)
        self._rules = rules or _DEFAULT_RULES
        self._etag_enabled = etag_enabled

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        cache_control = self._resolve_cache_control(request)
        if cache_control:
            response.headers.setdefault("Cache-Control", cache_control)

        if self._etag_enabled and request.method in ("GET", "HEAD") and response.status_code == 200:
            await self._apply_etag(request, response)

        return response

    def _resolve_cache_control(self, request: Request) -> str | None:
        for prefix, value in self._rules:
            if request.url.path.startswith(prefix):
                return value
        return "no-store"

    @staticmethod
    async def _apply_etag(request: Request, response: Response) -> None:
        body = b"".join([chunk async for chunk in response.body_iterator])

        async def _body_iterator():
            yield body

        response.body_iterator = _body_iterator()

        etag = f'"{_checksum(body)}"'
        response.headers.setdefault("ETag", etag)

        if_none_match = request.headers.get("If-None-Match")
        if if_none_match and if_none_match.strip('" ') == etag.strip('" '):
            response.status_code = 304
            response.headers["Content-Length"] = "0"

            async def _empty_body():
                yield b""

            response.body_iterator = _empty_body()

        if_modified_since = request.headers.get("If-Modified-Since")
        last_modified = response.headers.get("Last-Modified")
        if if_modified_since and last_modified:
            try:
                ims = time.mktime(time.strptime(if_modified_since, "%a, %d %b %Y %H:%M:%S %Z"))
                lm = time.mktime(time.strptime(last_modified, "%a, %d %b %Y %H:%M:%S %Z"))
                if ims >= lm:
                    response.status_code = 304
                    response.headers["Content-Length"] = "0"

                    async def _empty_body_2():
                        yield b""

                    response.body_iterator = _empty_body_2()
            except (ValueError, OSError):
                pass
