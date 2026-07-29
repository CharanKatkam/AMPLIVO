from typing import Any


def _example(error_code: str, message: str) -> dict[str, Any]:
    return {"content": {"application/json": {"example": {"error_code": error_code, "message": message}}}}


REGISTER_RESPONSES: dict[int | str, dict[str, Any]] = {
    409: {
        "description": "Email/username already exists, or the username is reserved",
        "content": {
            "application/json": {
                "examples": {
                    "email_already_exists": {
                        "value": {
                            "error_code": "email_already_exists",
                            "message": "A user with this email address already exists.",
                        }
                    },
                    "username_already_exists": {
                        "value": {
                            "error_code": "username_already_exists",
                            "message": "This username is already taken.",
                        }
                    },
                    "reserved_username": {
                        "value": {
                            "error_code": "reserved_username",
                            "message": "This username is reserved and cannot be used.",
                        }
                    },
                }
            }
        },
    },
    429: {
        "description": "Too many registration attempts from this IP",
        **_example("rate_limit_exceeded", "Too many requests. Please try again later."),
    },
}

LOGIN_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Invalid credentials",
        **_example("invalid_credentials", "Incorrect email/username or password."),
    },
    403: {
        "description": "Account is inactive",
        **_example("inactive_user", "This user account is inactive."),
    },
    423: {
        "description": "Account temporarily locked after too many failed attempts",
        **_example(
            "account_locked", "Account is temporarily locked due to too many failed login attempts."
        ),
    },
    429: {
        "description": "Too many login attempts from this IP",
        **_example("rate_limit_exceeded", "Too many requests. Please try again later."),
    },
}

REFRESH_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Invalid, expired, or revoked refresh token",
        **_example("invalid_token", "The provided token is invalid."),
    },
    429: {
        "description": "Too many refresh attempts from this IP",
        **_example("rate_limit_exceeded", "Too many requests. Please try again later."),
    },
}

LOGOUT_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Invalid refresh token",
        **_example("invalid_token", "The provided token is invalid."),
    },
}

ME_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Missing, invalid, or expired access token",
        **_example("invalid_token", "The provided token is invalid."),
    },
    403: {
        "description": "Account is inactive",
        **_example("inactive_user", "This user account is inactive."),
    },
}
