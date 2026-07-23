from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class VerifyEmailRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={"example": {"token": "kx3F1v8...redacted...q9Zt"}}
    )

    token: str = Field(..., min_length=20, max_length=512)


class ResendVerificationRequest(BaseModel):
    model_config = ConfigDict(json_schema_extra={"example": {"email": "jane.doe@amplivo.com"}})

    email: EmailStr


class VerificationStatusResponse(BaseModel):
    is_verified: bool
    verified_at: datetime | None
