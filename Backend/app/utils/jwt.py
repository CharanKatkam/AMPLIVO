import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt

from app.core.config import settings
from app.core.exceptions import InvalidTokenException, TokenExpiredException

TokenType = Literal["access", "refresh"]


def _encode(
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    *,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, str]:
    jti = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": jti,
    }
    if extra_claims:
        payload.update(extra_claims)
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti


def create_access_token(user_id: uuid.UUID, *, session_id: uuid.UUID | None = None) -> str:
    extra_claims = {"session_id": str(session_id)} if session_id is not None else None
    token, _ = _encode(
        str(user_id),
        "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims=extra_claims,
    )
    return token


def create_refresh_token(
    user_id: uuid.UUID, *, session_id: uuid.UUID | None = None
) -> tuple[str, str, datetime]:
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    extra_claims = {"session_id": str(session_id)} if session_id is not None else None
    token, jti = _encode(str(user_id), "refresh", expires_delta, extra_claims=extra_claims)
    expires_at = datetime.now(timezone.utc) + expires_delta
    return token, jti, expires_at


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredException() from exc
    except jwt.InvalidTokenError as exc:
        raise InvalidTokenException() from exc

    if payload.get("type") != expected_type:
        raise InvalidTokenException()

    return payload
