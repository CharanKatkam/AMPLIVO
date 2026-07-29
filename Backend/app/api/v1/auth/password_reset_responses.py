from typing import Any


def _example(error_code: str, message: str) -> dict[str, Any]:
    return {"content": {"application/json": {"example": {"error_code": error_code, "message": message}}}}


RESET_PASSWORD_RESPONSES: dict[int | str, dict[str, Any]] = {
    400: {
        "description": "New password does not meet strength requirements",
        **_example(
            "weak_password",
            "Password must be at least 8 characters and include an uppercase letter, "
            "a lowercase letter, a number, and a special character.",
        ),
    },
    401: {
        "description": "Reset token is invalid, already used, or expired",
        "content": {
            "application/json": {
                "examples": {
                    "invalid": {
                        "value": {
                            "error_code": "password_reset_token_invalid",
                            "message": (
                                "The password reset token is invalid or has already been used."
                            ),
                        }
                    },
                    "expired": {
                        "value": {
                            "error_code": "password_reset_token_expired",
                            "message": "The password reset token has expired.",
                        }
                    },
                }
            }
        },
    },
}
