"""Repository for magic-link access tokens."""
from __future__ import annotations

import uuid

from sqlalchemy import select

from app.modules.portal_access.models import PortalAccessToken
from app.repositories.base import BaseRepository


class PortalAccessTokenRepository(BaseRepository[PortalAccessToken]):
    model = PortalAccessToken

    async def get_by_token_hash(self, token_hash: str) -> PortalAccessToken | None:
        result = await self._db.execute(
            select(PortalAccessToken).where(PortalAccessToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()
