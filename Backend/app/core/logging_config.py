"""Structured JSON logging configuration.

Replaces ad-hoc ``logging.getLogger(__name__)`` string formatting across the
application with a JSON-based format that includes timestamps, severity,
logger name, and — when a request context is active — the correlation ID.

Usage from anywhere in the app::

    logger = logging.getLogger(__name__)
    logger.info("User registered", extra={"user_id": str(user.id)})
"""

from __future__ import annotations

import logging
import sys
import traceback
from datetime import datetime, timezone
from typing import Any

try:
    import orjson

    def _json_serialize(obj: Any) -> str:
        return orjson.dumps(obj, default=str).decode("utf-8")

except ImportError:
    import json

    def _json_serialize(obj: Any) -> str:
        return json.dumps(obj, default=str)


def setup_logging(level: str = "INFO") -> None:
    """Configure the root logger with JSON output to stderr.

    Call once at application startup (already done in ``main.py`` lifespan).
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove any pre-existing handlers added by uvicorn or other libs.
    for handler in root.handlers[:]:
        root.removeHandler(handler)

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(_JSONFormatter())
    root.addHandler(handler)

    # Quiet noisy third-party loggers.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("faker").setLevel(logging.WARNING)


class _JSONFormatter(logging.Formatter):
    """Emit log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        obj: dict[str, Any] = {
            "timestamp": self._format_timestamp(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Correlation / request ID from the logging extra context dict.
        correlation_id = getattr(record, "correlation_id", None)
        if correlation_id is not None:
            obj["correlation_id"] = correlation_id

        request_id = getattr(record, "request_id", None)
        if request_id is not None:
            obj["request_id"] = request_id

        user_id = getattr(record, "user_id", None)
        if user_id is not None:
            obj["user_id"] = str(user_id)

        # Include any extra keyword fields passed to logger.info(..., extra=...).
        for key in ("duration_ms", "status_code", "method", "path", "ip"):
            val = getattr(record, key, None)
            if val is not None:
                obj[key] = val

        if record.exc_info and record.exc_info[0] is not None:
            obj["exception"] = "".join(traceback.format_exception(*record.exc_info))

        return _json_serialize(obj)

    @staticmethod
    def _format_timestamp(record: logging.LogRecord) -> str:
        # ``logging.Formatter.formatTime`` forwards ``datefmt`` to
        # ``time.strftime``, which does not support ``%f`` (that directive
        # only exists on ``datetime.strftime``). On some platforms an
        # unrecognized directive raises ``ValueError: Invalid format
        # string`` instead of being ignored, so build the ISO-8601 UTC
        # timestamp via ``datetime`` directly.
        dt = datetime.fromtimestamp(record.created, tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
