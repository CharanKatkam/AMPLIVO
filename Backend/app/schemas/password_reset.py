from pydantic import ConfigDict, EmailStr, Field

from app.core.sanitizers import SanitizedModel


class ForgotPasswordRequest(SanitizedModel):
    email: EmailStr


class ResetPasswordRequest(SanitizedModel):
    token: str = Field(..., min_length=20, max_length=512)
    new_password: str = Field(..., min_length=8, max_length=128)
