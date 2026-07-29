import uuid

from fastapi import Request


def resolve_session_id(request: Request) -> uuid.UUID | None:
    """Return the session_id claim SessionMiddleware resolved from the
    caller's access token, if any - lets 'terminate my current session'
    endpoints identify the caller's session from the Bearer token alone.
    """
    raw = getattr(request.state, "session_id", None)
    if not raw:
        return None
    try:
        return uuid.UUID(raw)
    except (ValueError, TypeError):
        return None
