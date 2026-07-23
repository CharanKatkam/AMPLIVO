from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.verification_responses import SEND_VERIFICATION_RESPONSES, VERIFY_EMAIL_RESPONSES
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.services import get_email_verification_service
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.user import UserRead
from app.schemas.verification import (
    ResendVerificationRequest,
    VerificationStatusResponse,
    VerifyEmailRequest,
)
from app.services.email_verification_service import EmailVerificationService
from app.utils.request_context import resolve_client_context

router = APIRouter(prefix="/auth", tags=["Email Verification"])


@router.post(
    "/send-verification",
    response_model=MessageResponse,
    summary="Send (or resend) a verification email to the current user",
    responses=SEND_VERIFICATION_RESPONSES,
)
async def send_verification(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    verification_service: EmailVerificationService = Depends(get_email_verification_service),
) -> MessageResponse:
    client_context = resolve_client_context(request)
    await verification_service.send_verification_email(
        current_user,
        endpoint=request.url.path,
        request_method=request.method,
        client_context=client_context,
    )
    await db.commit()
    return MessageResponse(message="Verification email sent.")


@router.post(
    "/verify-email",
    response_model=UserRead,
    summary="Verify an email address using a verification token",
    responses=VERIFY_EMAIL_RESPONSES,
)
async def verify_email(
    payload: VerifyEmailRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    verification_service: EmailVerificationService = Depends(get_email_verification_service),
) -> User:
    client_context = resolve_client_context(request)
    user = await verification_service.verify_email(
        token=payload.token,
        endpoint=request.url.path,
        request_method=request.method,
        client_context=client_context,
    )
    await db.commit()
    return user


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Request a new verification email by address, without authenticating",
)
async def resend_verification(
    payload: ResendVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    verification_service: EmailVerificationService = Depends(get_email_verification_service),
) -> MessageResponse:
    client_context = resolve_client_context(request)
    await verification_service.resend_verification_by_email(
        payload.email,
        endpoint=request.url.path,
        request_method=request.method,
        client_context=client_context,
    )
    await db.commit()
    return MessageResponse(
        message="If that email is registered and not yet verified, a verification link has been sent."
    )


@router.get(
    "/verification-status",
    response_model=VerificationStatusResponse,
    summary="Get the current user's email verification status",
)
async def verification_status(
    current_user: User = Depends(get_current_user),
) -> VerificationStatusResponse:
    return VerificationStatusResponse(
        is_verified=current_user.is_verified, verified_at=current_user.verified_at
    )
