from typing import Any


def _example(error_code: str, message: str) -> dict[str, Any]:
    return {"content": {"application/json": {"example": {"error_code": error_code, "message": message}}}}


SESSION_LIST_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Missing, invalid, or expired access token",
        **_example("invalid_token", "The provided token is invalid."),
    },
}

TERMINATE_SESSION_RESPONSES: dict[int | str, dict[str, Any]] = {
    **SESSION_LIST_RESPONSES,
    404: {
        "description": "Session not found, already terminated, or not owned by the caller",
        **_example("session_not_found", "Session not found or already terminated."),
    },
}

TERMINATE_CURRENT_SESSION_RESPONSES: dict[int | str, dict[str, Any]] = {
    **SESSION_LIST_RESPONSES,
    404: {
        "description": "No session could be resolved from the current access token",
        **_example("session_not_found", "Session not found or already terminated."),
    },
}
