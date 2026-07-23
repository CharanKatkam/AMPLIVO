from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(json_schema_extra={"example": {"email": "jane.doe@amplivo.com"}})

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "token": "kx3F1v8...redacted...q9Zt",
                "new_password": "NewSecure!Pass1",
            }
        }
    )

    token: str = Field(..., min_length=20, max_length=512)
    new_password: str = Field(..., min_length=8, max_length=128)
