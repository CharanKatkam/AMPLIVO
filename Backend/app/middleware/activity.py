import logging
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.dependencies.db import get_db
from app.repositories.user_session_repository import UserSessionRepository

logger = logging.getLogger("app.middleware.activity")


class ActivityMiddleware(BaseHTTPMiddleware):
    """Best-effort touch of the caller's session.last_activity on every
    authenticated request, using the session_id SessionMiddleware resolved
    from the access token (must run after SessionMiddleware in the stack).

    Resolves its database session through the app's own dependency-override
    mechanism (`request.app.dependency_overrides`) rather than importing
    AsyncSessionLocal directly, so it transparently uses the test suite's
    in-memory SQLite database during tests and the real database in
    production - the same override the get_db dependency itself relies on.
    Never blocks or fails the request if the update itself fails.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        session_id = getattr(request.state, "session_id", None)
        if session_id:
            await self._touch_activity(request, session_id)
        return await call_next(request)

    async def _touch_activity(self, request: Request, session_id: str) -> None:
        db_factory = request.app.dependency_overrides.get(get_db, get_db)
        db_generator = db_factory()
        try:
            db = await anext(db_generator)
            try:
                await UserSessionRepository(db).touch_last_activity(uuid.UUID(session_id))
                await db.commit()
            finally:
                await db_generator.aclose()
        except Exception:
            logger.debug(
                "Failed to update session activity for session_id=%s", session_id, exc_info=True
            )
