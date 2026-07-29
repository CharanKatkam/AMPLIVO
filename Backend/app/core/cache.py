"""In-memory and Redis cache utilities.

Provides:
- ``TTLCache`` — thread-safe in-memory cache with TTL expiry, suitable for
  caching infrequently-changing reference data (role lookups, config values).
- ``redis_cache`` — awaitable helper for Redis get/set when REDIS_URL is set.
"""

from __future__ import annotations

import time
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from app.core.config import settings

T = TypeVar("T")

try:
    import orjson

    def _json_dumps(obj: Any) -> str:
        return orjson.dumps(obj).decode("utf-8")

    def _json_loads(s: str) -> Any:
        return orjson.loads(s)

except ImportError:
    import json

    def _json_dumps(obj: Any) -> str:
        return json.dumps(obj, default=str)

    def _json_loads(s: str) -> Any:
        return json.loads(s)


class TTLCache:
    """Simple in-memory cache with per-key TTL.

    Not async-safe for concurrent writers under heavy contention, but
    perfectly adequate for infrequently-written cached values (reference
    data, config lookups, role slug resolution, etc.).
    """

    __slots__ = ("_store", "_ttl")

    def __init__(self, default_ttl_seconds: int = 300) -> None:
        self._store: dict[str, tuple[float, Any]] = {}
        self._ttl = default_ttl_seconds

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._ttl
        self._store[key] = (time.monotonic() + ttl, value)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()

    def invalidate_pattern(self, prefix: str) -> None:
        for key in list(self._store):
            if key.startswith(prefix):
                del self._store[key]


# Module-level singleton — imported by middleware, services, and deps.
cache = TTLCache(default_ttl_seconds=300)


async def cached_call(
    key: str,
    factory: Callable[[], Awaitable[T]],
    ttl_seconds: int | None = None,
) -> T:
    """Return *key* from cache, or call *factory* to compute and cache it."""
    existing = cache.get(key)
    if existing is not None:
        return existing
    value = await factory()
    cache.set(key, value, ttl_seconds=ttl_seconds)
    return value


# ── Optional Redis support ─────────────────────────────────────────────

_redis_pool = None


async def get_redis():
    """Lazy-init and return a Redis async connection (or None if unconfigured)."""
    global _redis_pool
    if not settings.REDIS_URL:
        return None
    if _redis_pool is None:
        try:
            import redis.asyncio as aioredis

            _redis_pool = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                max_connections=10,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
        except ImportError:
            return None
    return _redis_pool


async def close_redis() -> None:
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.close()
        _redis_pool = None
