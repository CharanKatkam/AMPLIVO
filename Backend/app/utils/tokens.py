import hashlib
import secrets
from datetime import datetime, timedelta

from app.utils.time import utc_now


def generate_secure_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def new_token_with_hash(*, expires_in: timedelta) -> tuple[str, str, datetime]:
    """Generate a raw token plus its hash and expiry, for tables that store
    only the hash (email_verification_tokens, password_reset_tokens) -
    mirrors the pattern already used for refresh tokens in AuthService.
    """
    raw_token = generate_secure_token()
    return raw_token, hash_token(raw_token), utc_now() + expires_in
