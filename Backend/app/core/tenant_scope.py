"""Plain (non-FastAPI) helper for enforcing per-client tenant scoping in services."""
from __future__ import annotations

import uuid

from app.core.exceptions import ForbiddenException


def enforce_client_scope(resource_client_id: uuid.UUID | None, scoped_client_id: uuid.UUID | None) -> None:
    """Raise if a client-scoped caller (scoped_client_id is not None) is trying to
    access a resource that doesn't belong to their own client. No-op for staff
    callers (scoped_client_id is None).
    """
    if scoped_client_id is None:
        return
    if resource_client_id != scoped_client_id:
        raise ForbiddenException("You do not have access to this resource.")
