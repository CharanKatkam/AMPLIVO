from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_aware_utc(value: datetime | None) -> datetime | None:
    """Normalize a datetime read back from the database to be tz-aware UTC.

    Postgres (asyncpg) returns tz-aware datetimes for TIMESTAMPTZ columns, but
    SQLite has no native timezone storage and always returns naive datetimes
    (used in tests). Since every such column is written as UTC, a naive value
    can be safely reinterpreted as UTC before comparing it against utc_now().
    """
    if value is None:
        return None
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
