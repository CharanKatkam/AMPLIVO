"""Role-based route gating.

Reuses the existing role-slug lookup from ``app.dependencies.tenant`` (already
depended on by every tenant-scoped route) so this adds a single extra check on
top of ``get_current_user`` rather than a parallel auth system.
"""
from __future__ import annotations

from fastapi import Depends

from app.core.exceptions import ForbiddenException
from app.dependencies.tenant import get_current_user_role_slug

# Roles that can always act as staff/admin regardless of which allowlist is checked.
ALWAYS_ALLOWED_SLUGS = {"admin", "super_admin"}

# Every internal/staff role - i.e. everyone except the client-portal role.
# Use `require_roles(*STAFF_ROLE_SLUGS)` for endpoints that must stay closed
# to client-portal users but aren't owned by one specific department (e.g.
# a lookup that would otherwise let a client enumerate another client's
# records by id, with no natural single owning role to name instead).
STAFF_ROLE_SLUGS = ("admin", "sales", "hr", "employee", "crm", "finance", "marketing")


def require_roles(*allowed_slugs: str):
    """Dependency factory: 403s unless the caller's role slug is in `allowed_slugs`
    (or is an admin/super_admin, who always pass)."""
    allowed = set(allowed_slugs) | ALWAYS_ALLOWED_SLUGS

    async def _check(role_slug: str | None = Depends(get_current_user_role_slug)) -> str:
        if role_slug not in allowed:
            raise ForbiddenException("You do not have permission to access this module.")
        return role_slug

    return _check
