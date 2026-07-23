import logging
import time
from contextlib import asynccontextmanager

from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import check_database_connection, engine
from app.dependencies.db import get_db
from app.middleware.activity import ActivityMiddleware
from app.middleware.audit import AuditMiddleware
from app.middleware.authentication import AuthenticationMiddleware
from app.middleware.error_boundary import UnhandledErrorMiddleware
from app.middleware.exception_handler import register_exception_handlers
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.session import SessionMiddleware

logger = logging.getLogger("app.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    is_healthy, latency_ms = await check_database_connection()
    if is_healthy:
        logger.info("Database connection verified at startup (%.2f ms).", latency_ms)
    else:
        # Not fatal: liveness (/health) must not depend on the database, and
        # container orchestrators frequently start this process before the
        # database is reachable. /health/database is the readiness signal.
        logger.warning(
            "Database connection could not be verified at startup - "
            "the app will still boot; check DATABASE_URL and DB_SSL_MODE."
        )
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description=(
        "Authentication module for the Amplivo Digital Marketing ERP + Client "
        "Portal: registration, login, logout, token refresh, current-user "
        "retrieval, and Phase 2 enterprise security (audit logging, login "
        "history, account lockout, device tracking, rate limiting)."
    ),
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# Middleware is added innermost-first: Starlette wraps the stack so the LAST
# middleware added ends up OUTERMOST (sees the request first, the response
# last). Desired outer-to-inner order: CORS, UnhandledError, SecurityHeaders,
# RateLimiter, Audit, Session, Activity, Authentication - so SecurityHeaders
# still stamps headers onto a 429 returned directly by RateLimiter, CORS
# handles preflight before anything else runs, and SessionMiddleware resolves
# request.state.session_id before ActivityMiddleware reads it (Session must
# be added after - i.e. more outer than - Activity for that ordering to hold).
# UnhandledErrorMiddleware sits just inside CORS so a raw exception (e.g. a
# DB error not wrapped in AppException) still produces a response that
# passes back through CORSMiddleware - see error_boundary.py for why that
# would otherwise strip CORS headers and look like a CORS bug in the browser.
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(ActivityMiddleware)
app.add_middleware(SessionMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(UnhandledErrorMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url=f"{settings.API_V1_PREFIX}/docs")


@app.get("/health", tags=["Health"], summary="Service liveness check")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get(
    "/health/database",
    tags=["Health"],
    summary="Database connectivity readiness check",
    description=(
        "Runs a lightweight SELECT 1 through the request-scoped session and "
        "reports round-trip latency. Returns 503 if the database cannot be "
        "reached - use this as the readiness probe, not /health, which "
        "deliberately never touches the database."
    ),
)
async def database_health_check(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    start = time.perf_counter()
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        latency_ms = (time.perf_counter() - start) * 1000
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "latency": f"{latency_ms:.2f} ms"},
        )

    latency_ms = (time.perf_counter() - start) * 1000
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "database": "connected", "latency": f"{latency_ms:.2f} ms"},
    )
