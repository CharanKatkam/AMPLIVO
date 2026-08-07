import asyncio
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
from app.core.cache import close_redis
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.db.session import AsyncSessionLocal, check_database_connection, engine
from app.dependencies.db import get_db
from app.middleware.activity import ActivityMiddleware
from app.middleware.audit import AuditMiddleware
from app.middleware.authentication import AuthenticationMiddleware
from app.middleware.cache_headers import CacheHeadersMiddleware
from app.middleware.compression import CompressionMiddleware
from app.middleware.csrf import CSRFMiddleware
from app.middleware.error_boundary import UnhandledErrorMiddleware
from app.middleware.exception_handler import register_exception_handlers
from app.middleware.performance_logger import PerformanceLoggerMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.session import SessionMiddleware

logger = logging.getLogger("app.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Structured logging ────────────────────────────────────────────────
    setup_logging(level=settings.LOG_LEVEL)

    # ── Database connectivity ─────────────────────────────────────────────
    is_healthy, latency_ms = await check_database_connection()
    if is_healthy:
        logger.info(
            "Database connection verified at startup",
            extra={"duration_ms": round(latency_ms, 2)},
        )
        # Demo data seeding is deferred to a background task so it never
        # blocks the application from starting up to serve requests.
        asyncio.create_task(_seed_demo_background())
    else:
        logger.warning(
            "Database connection could not be verified at startup — "
            "the app will still boot; check DATABASE_URL and DB_SSL_MODE."
        )
    yield
    await engine.dispose()
    await close_redis()


async def _seed_demo_background() -> None:
    """Idempotent demo data seeding, run in the background after startup."""
    if not settings.SEED_DEMO_DATA or settings.ENVIRONMENT.lower() == "production":
        logger.info("Demo data seeding skipped (disabled or production mode).")
        return
    try:
        from app.scripts.seed_demo_data import seed_demo_data

        async with AsyncSessionLocal() as session:
            created = await seed_demo_data(session)
        if any(created.values()):
            logger.info("Demo data seeded", extra={"created": created})
    except Exception:
        logger.exception("Demo data seeding failed — continuing without it.")


is_production = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description=(
        "Authentication module for the Amplivo Digital Marketing ERP + Client "
        "Portal: registration, login, logout, token refresh, current-user "
        "retrieval, and Phase 2 enterprise security (audit logging, login "
        "history, account lockout, device tracking, rate limiting)."
    ),
    openapi_url=None if is_production else f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=None if is_production else f"{settings.API_V1_PREFIX}/docs",
    redoc_url=None if is_production else f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# Middleware is added innermost-first: Starlette wraps the stack so the LAST
# middleware added ends up OUTERMOST (sees the request first, the response
# last). Desired outer-to-inner order (performance/compression/logging at
# the outside, then CORS, then security, then auth):
#   Compression, PerformanceLogger, RequestID, CacheHeaders,
#   CORSMiddleware, UnhandledError, SecurityHeaders, RateLimiter, CSRF,
#   Audit, Session, Activity, Authentication
#
# Compression sits outermost so the response body is compressed last
# (after all inner middleware and the route have produced it).
# PerformanceLogger captures full end-to-end timing.
# RequestID must run early so every downstream component sees the IDs.
# CacheHeaders runs after Compression so ETags reflect the compressed body.
# Everything else follows the existing ordering rationale.
from app.middleware.body_limit import ContentSizeLimitMiddleware

app.add_middleware(AuthenticationMiddleware)
app.add_middleware(ActivityMiddleware)
app.add_middleware(SessionMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(UnhandledErrorMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With", "X-CSRF-Token"],
)
app.add_middleware(CacheHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(PerformanceLoggerMiddleware)
app.add_middleware(
    CompressionMiddleware,
    minimum_size=settings.COMPRESSION_MIN_SIZE,
)
app.add_middleware(ContentSizeLimitMiddleware)

register_exception_handlers(app)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url=f"{settings.API_V1_PREFIX}/docs")


@app.get("/health", tags=["Health"], summary="Liveness probe")
async def liveness() -> dict[str, str]:
    """Minimal liveness check — never touches the database."""
    return {"status": "ok"}


@app.get("/health/ready", tags=["Health"], summary="Readiness probe")
async def readiness(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """Readiness check: verifies the database is reachable.

    Orchestrators should call this endpoint (not /health) to decide
    whether this instance is ready to receive traffic.
    """
    return await _db_health(db)


@app.get(
    "/health/database",
    tags=["Health"],
    summary="Database connectivity check (legacy alias for /health/ready)",
)
async def database_health_check(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    return await _db_health(db)


async def _db_health(db: AsyncSession) -> JSONResponse:
    start = time.perf_counter()
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        latency_ms = (time.perf_counter() - start) * 1000
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "latency_ms": round(latency_ms, 2),
            },
        )

    latency_ms = (time.perf_counter() - start) * 1000
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "database": "connected",
            "latency_ms": round(latency_ms, 2),
        },
    )
