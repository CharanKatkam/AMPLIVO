from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.password_reset_responses import RESET_PASSWORD_RESPONSES
from app.dependencies.db import get_db
from app.dependencies.services import get_password_reset_service
from app.schemas.auth import MessageResponse
from app.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest
from app.services.password_reset_service import PasswordResetService
from app.utils.request_context import resolve_client_context

router = APIRouter(prefix="/auth", tags=["Password Reset"])


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset email",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    password_reset_service: PasswordResetService = Depends(get_password_reset_service),
) -> MessageResponse:
    client_context = resolve_client_context(request)
    await password_reset_service.request_reset(
        email=payload.email,
        endpoint=request.url.path,
        request_method=request.method,
        client_context=client_context,
    )
    await db.commit()
    return MessageResponse(
        message="If that email is registered, password reset instructions have been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset a password using a valid reset token",
    responses=RESET_PASSWORD_RESPONSES,
)
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    password_reset_service: PasswordResetService = Depends(get_password_reset_service),
) -> MessageResponse:
    client_context = resolve_client_context(request)
    await password_reset_service.reset_password(
        token=payload.token,
        new_password=payload.new_password,
        endpoint=request.url.path,
        request_method=request.method,
        client_context=client_context,
    )
    await db.commit()
    return MessageResponse(message="Password has been reset successfully. Please log in again.")
