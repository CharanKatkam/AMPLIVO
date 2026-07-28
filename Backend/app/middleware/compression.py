"""Response compression middleware supporting Brotli and GZip.

Negotiates the encoding with the client via the ``Accept-Encoding`` header:
Brotli (br) is preferred when the client advertises it, with GZip as fallback.

Only compresses responses whose body exceeds ``minimum_size`` bytes and whose
``Content-Type`` is compressible (text, json, javascript, xml, etc.).
"""

from __future__ import annotations

import io
import logging
import re
from typing import Literal

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

try:
    import brotli

    HAS_BROTLI = True
except ImportError:
    HAS_BROTLI = False
    logger.warning("brotli not installed — falling back to GZip only")

_COMPRESSIBLE_CONTENT_TYPES: re.Pattern = re.compile(
    r"^(text/|application/(json|javascript|xml|yaml|graphql\+json|ld\+json|vnd\.api\+json"
    r"|problem\+json|octet-stream))",
    re.IGNORECASE,
)

_ENCODING_PRIORITY: list[tuple[str, Literal["br", "gzip"]]] = [
    ("br", "br" if HAS_BROTLI else "gzip"),
    ("gzip", "gzip"),
]


class CompressionMiddleware(BaseHTTPMiddleware):
    """Compresses eligible responses with Brotli (preferred) or GZip."""

    def __init__(self, app: ASGIApp, minimum_size: int = 512) -> None:
        super().__init__(app)
        self.minimum_size = minimum_size

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        if self._should_compress(request, response):
            encoding = self._negotiate_encoding(request)
            if encoding:
                body = b"".join([chunk async for chunk in response.body_iterator])
                response.headers["Content-Encoding"] = encoding
                response.headers["Vary"] = _merge_vary(response.headers.get("Vary", ""), "Accept-Encoding")
                if encoding == "br":
                    body = brotli.compress(body)
                else:
                    import gzip
                    body = gzip.compress(body)
                response.headers["Content-Length"] = str(len(body))

                async def _compressed_body_iterator():
                    yield body

                response.body_iterator = _compressed_body_iterator()

        return response

    def _should_compress(self, request: Request, response: Response) -> bool:
        if response.status_code < 200 or response.status_code in (204, 304):
            return False
        if "Content-Encoding" in response.headers:
            return False
        content_type = response.headers.get("Content-Type", "")
        if not _COMPRESSIBLE_CONTENT_TYPES.match(content_type):
            return False
        content_length = response.headers.get("Content-Length")
        if content_length is not None:
            try:
                if int(content_length) < self.minimum_size:
                    return False
            except ValueError:
                pass
        return True

    @staticmethod
    def _negotiate_encoding(request: Request) -> str | None:
        accept_encoding = request.headers.get("Accept-Encoding", "")
        for token, actual in _ENCODING_PRIORITY:
            if token in accept_encoding:
                return actual
        return None


def _merge_vary(existing: str, new: str) -> str:
    items = [s.strip() for s in existing.split(",") if s.strip()]
    if new not in items:
        items.append(new)
    return ", ".join(items)
