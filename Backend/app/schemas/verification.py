from datetime import datetime

from pydantic import ConfigDict, EmailStr, Field

from app.core.sanitizers import SanitizedModel


class VerifyEmailRequest(SanitizedModel):
    token: str = Field(..., min_length=20, max_length=512)


class ResendVerificationRequest(SanitizedModel):
    email: EmailStr


class VerificationStatusResponse(SanitizedModel):
    model_config = ConfigDict(from_attributes=True)

    is_verified: bool
    verified_at: datetime | None
