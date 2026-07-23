import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.]+$")
    full_name: str = Field(min_length=2, max_length=150)


class UserCreate(UserBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "jane.doe@amplivo.com",
                "username": "jane_doe",
                "full_name": "Jane Doe",
                "password": "SecurePass123",
            }
        }
    )

    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit.")
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must contain at least one letter.")
        return value


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str
    is_active: bool
    is_verified: bool
    verified_at: datetime | None
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime
    role_name: str | None = None


class EmailExistsResponse(BaseModel):
    email: EmailStr
    exists: bool


class UsernameExistsResponse(BaseModel):
    username: str
    exists: bool
