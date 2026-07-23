import pytest
from httpx import AsyncClient

RESERVED_NAMES = ["admin", "administrator", "root", "system", "support", "api", "superadmin"]


@pytest.mark.parametrize("reserved_name", RESERVED_NAMES)
async def test_register_with_reserved_username_rejected(client: AsyncClient, reserved_name: str) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{reserved_name}@amplivo.com",
            "username": reserved_name,
            "full_name": "Reserved Name",
            "password": "SecurePass123",
        },
    )
    assert response.status_code == 409
    assert response.json()["error_code"] == "reserved_username"


async def test_register_with_reserved_username_is_case_insensitive(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "shout@amplivo.com",
            "username": "ADMIN",
            "full_name": "Shouty Admin",
            "password": "SecurePass123",
        },
    )
    assert response.status_code == 409
    assert response.json()["error_code"] == "reserved_username"


async def test_register_with_non_reserved_username_succeeds(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "regular.user@amplivo.com",
            "username": "regular_user",
            "full_name": "Regular User",
            "password": "SecurePass123",
        },
    )
    assert response.status_code == 201
