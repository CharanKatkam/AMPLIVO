import logging
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.db.session import AsyncSessionLocal
from app.repositories.user_session_repository import UserSessionRepository

logger = logging.getLogger("app.middleware.activity")

_ACTIVITY_SAMPLE_RATE = 0.1  # only touch 1 in 10 requests


class ActivityMiddleware(BaseHTTPMiddleware):
    """Best-effort touch of the caller's session.last_activity.

    Sampled at ``_ACTIVITY_SAMPLE_RATE`` (10 %) to reduce database write
    pressure on high-traffic endpoints — frequent updates to the same
    row from the same user within seconds achieve very little in practice.

    Uses ``AsyncSessionLocal`` directly (not the DI override) to avoid
    the overhead of a full dependency-resolve cycle.  The test suite
    exercises session-activity indirectly through the auth flow; this
    middleware is intentionally best-effort and never blocks the request.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        session_id = getattr(request.state, "session_id", None)
        if session_id:
            await self._touch_activity(request, session_id)
        return await call_next(request)

    async def _touch_activity(self, request: Request, session_id: str) -> None:
        import random
        if random.random() > _ACTIVITY_SAMPLE_RATE:
            return
        try:
            async with AsyncSessionLocal() as db:
                await UserSessionRepository(db).touch_last_activity(uuid.UUID(session_id))
                await db.commit()
        except Exception:
            logger.debug(
                "Failed to update session activity for session_id=%s", session_id, exc_info=True
            )
