"""Service for issuing/validating/consuming magic-link access tokens.

Reuses app/utils/tokens.py's generate_secure_token()/hash_token()/
new_token_with_hash() exactly as email_verification_tokens and
password_reset_tokens already do - no new token primitive.
"""
from __future__ import annotations

import uuid
from datetime import timedelta

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.portal_access.models import PortalAccessToken
from app.modules.portal_access.repository import PortalAccessTokenRepository
from app.utils.time import as_aware_utc, utc_now
from app.utils.tokens import hash_token, new_token_with_hash


class PortalAccessTokenService:
    def __init__(self, repo: PortalAccessTokenRepository) -> None:
        self._repo = repo

    async def issue(
        self,
        *,
        resource_type: str,
        resource_id: uuid.UUID,
        lead_id: uuid.UUID | None,
        expires_in: timedelta,
        is_single_use: bool,
        created_by: uuid.UUID | None,
    ) -> str:
        """Creates the token row and returns the raw (unhashed) token - the
        only place the raw value ever exists; only its hash is persisted."""
        raw_token, token_hash_value, expires_at = new_token_with_hash(expires_in=expires_in)
        await self._repo.create_from_dict({
            "resource_type": resource_type,
            "resource_id": resource_id,
            "lead_id": lead_id,
            "token_hash": token_hash_value,
            "is_single_use": is_single_use,
            "expires_at": expires_at,
            "created_by": created_by,
        })
        return raw_token

    async def validate(self, raw_token: str, *, resource_type: str) -> PortalAccessToken:
        token_hash_value = hash_token(raw_token)
        stored = await self._repo.get_by_token_hash(token_hash_value)
        if stored is None or stored.resource_type != resource_type:
            raise NotFoundException("Access link")
        if stored.is_single_use and stored.used_at is not None:
            raise BadRequestException("This link has already been used.")
        expires_at = as_aware_utc(stored.expires_at)
        if expires_at is not None and expires_at < utc_now():
            raise BadRequestException("This link has expired.")
        return stored

    async def consume(self, token: PortalAccessToken) -> None:
        if token.is_single_use:
            token.used_at = utc_now()
