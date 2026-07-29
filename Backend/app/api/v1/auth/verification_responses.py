from typing import Any


def _example(error_code: str, message: str) -> dict[str, Any]:
    return {"content": {"application/json": {"example": {"error_code": error_code, "message": message}}}}


SEND_VERIFICATION_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Missing, invalid, or expired access token",
        **_example("invalid_token", "The provided token is invalid."),
    },
    409: {
        "description": "Email address is already verified",
        **_example("email_already_verified", "This email address has already been verified."),
    },
}

VERIFY_EMAIL_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Verification token is invalid, already used, or expired",
        "content": {
            "application/json": {
                "examples": {
                    "invalid": {
                        "value": {
                            "error_code": "verification_token_invalid",
                            "message": (
                                "The email verification token is invalid or has already "
                                "been used."
                            ),
                        }
                    },
                    "expired": {
                        "value": {
                            "error_code": "verification_token_expired",
                            "message": "The email verification token has expired.",
                        }
                    },
                }
            }
        },
    },
}
