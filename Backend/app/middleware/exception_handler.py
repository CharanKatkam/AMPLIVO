import logging

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


def error_response(exc: AppException) -> JSONResponse:
    """Build the standard {error_code, message} JSON body for an AppException.

    Exposed separately from the registered handler below because exceptions
    raised directly inside a BaseHTTPMiddleware's dispatch() (e.g. the rate
    limiter) never reach FastAPI's ExceptionMiddleware - that middleware only
    wraps the router, and user-added middlewares sit outside it. Such
    middleware must build and return the JSONResponse itself.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"error_code": exc.error_code, "message": exc.message},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return error_response(exc)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder(
                {
                    "error_code": "validation_error",
                    "message": "Request validation failed.",
                    "details": exc.errors(),
                }
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error_code": "http_error", "message": str(exc.detail)},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception while processing %s %s", request.method, request.url)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error_code": "internal_error", "message": "An unexpected error occurred."},
        )
