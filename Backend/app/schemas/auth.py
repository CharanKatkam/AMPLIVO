from pydantic import BaseModel, ConfigDict, Field

from app.core.sanitizers import prevent_header_injection, sanitize_string


class LoginRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "identifier": "jane.doe@amplivo.com",
                "password": "SecurePass123",
            }
        }
    )

    identifier: str = Field(..., min_length=3, max_length=255, description="Email address or username")
    password: str = Field(..., min_length=8, max_length=128)

    @classmethod
    def _sanitize_login(cls, data: dict) -> dict:
        if isinstance(data, dict):
            if "identifier" in data and isinstance(data["identifier"], str):
                data["identifier"] = sanitize_string(prevent_header_injection(data["identifier"]))
        return data


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)
