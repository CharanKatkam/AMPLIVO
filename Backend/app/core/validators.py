"""Reusable validation helpers for Pydantic models.

Phone, URL, UUID, slug, and email normalization functions that can be
used inside ``@field_validator`` or ``@model_validator`` decorators.
"""

from __future__ import annotations

import re
import uuid
from typing import Any

_PHONE_RE = re.compile(r"^\+?1?\d{7,15}$")
_URL_RE = re.compile(
    r"^(https?://)"  # http:// or https://
    r"([\w\-]+\.)+[\w\-]+"  # domain
    r"(:\d+)?"  # optional port
    r"(/[\w\-\.~:/?#\[\]@!$&'()*+,;=]*)?"  # path + query + fragment
    r"$",
    re.IGNORECASE,
)
_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_RESERVED_NAMES = frozenset({"admin", "administrator", "root", "system", "support", "api", "superadmin"})


def validate_phone(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"[\s\-\(\)\.]+", "", value)
    if not _PHONE_RE.match(cleaned):
        raise ValueError(f"Invalid phone number format: '{value}'")
    return cleaned


def validate_url(value: str | None) -> str | None:
    if value is None:
        return None
    if not _URL_RE.match(value):
        raise ValueError(f"Invalid URL format: '{value}'")
    return value


def validate_uuid(value: Any) -> uuid.UUID:
    if isinstance(value, uuid.UUID):
        return value
    try:
        return uuid.UUID(str(value))
    except (ValueError, AttributeError):
        raise ValueError(f"Invalid UUID: '{value}'")


def validate_slug(value: str) -> str:
    if not _SLUG_RE.match(value):
        raise ValueError(
            f"Invalid slug: '{value}' — must start/end with alphanumeric, "
            f"contain only lowercase letters, digits, hyphens, underscores."
        )
    return value


def normalize_email(value: str) -> str:
    cleaned = value.strip().lower()
    if not _EMAIL_RE.match(cleaned):
        raise ValueError(f"Invalid email address: '{value}'")
    return cleaned


def validate_not_reserved(value: str) -> str:
    if value.lower() in _RESERVED_NAMES:
        raise ValueError(f"'{value}' is a reserved name and cannot be used.")
    return value
