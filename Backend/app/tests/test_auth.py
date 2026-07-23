from httpx import AsyncClient

REGISTER_PAYLOAD = {
    "email": "jane.doe@amplivo.com",
    "username": "jane_doe",
    "full_name": "Jane Doe",
    "password": "SecurePass123",
}


async def _register(client: AsyncClient, **overrides):
    payload = {**REGISTER_PAYLOAD, **overrides}
    return await client.post("/api/v1/auth/register", json=payload)


async def _login(client: AsyncClient, identifier: str | None = None, password: str | None = None):
    return await client.post(
        "/api/v1/auth/login",
        json={
            "identifier": identifier or REGISTER_PAYLOAD["email"],
            "password": password or REGISTER_PAYLOAD["password"],
        },
    )


async def test_register_creates_user(client: AsyncClient) -> None:
    response = await _register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == REGISTER_PAYLOAD["email"]
    assert body["username"] == REGISTER_PAYLOAD["username"]
    assert body["is_active"] is True
    assert "hashed_password" not in body
    assert "password" not in body


async def test_register_duplicate_email_rejected(client: AsyncClient) -> None:
    await _register(client)
    response = await _register(client, username="another_user")
    assert response.status_code == 409
    assert response.json()["error_code"] == "email_already_exists"


async def test_register_duplicate_username_rejected(client: AsyncClient) -> None:
    await _register(client)
    response = await _register(client, email="other@amplivo.com")
    assert response.status_code == 409
    assert response.json()["error_code"] == "username_already_exists"


async def test_register_weak_password_rejected(client: AsyncClient) -> None:
    response = await _register(client, password="alllowercase")
    assert response.status_code == 422


async def test_register_invalid_email_rejected(client: AsyncClient) -> None:
    response = await _register(client, email="not-an-email")
    assert response.status_code == 422


async def test_check_email_exists(client: AsyncClient) -> None:
    await _register(client)

    response = await client.get(
        "/api/v1/auth/check-email", params={"email": REGISTER_PAYLOAD["email"]}
    )
    assert response.status_code == 200
    assert response.json()["exists"] is True

    response = await client.get(
        "/api/v1/auth/check-email", params={"email": "unknown@amplivo.com"}
    )
    assert response.json()["exists"] is False


async def test_check_username_exists(client: AsyncClient) -> None:
    await _register(client)

    response = await client.get(
        "/api/v1/auth/check-username", params={"username": REGISTER_PAYLOAD["username"]}
    )
    assert response.status_code == 200
    assert response.json()["exists"] is True

    response = await client.get(
        "/api/v1/auth/check-username", params={"username": "someone_else"}
    )
    assert response.json()["exists"] is False


async def test_login_success_returns_tokens(client: AsyncClient) -> None:
    await _register(client)
    response = await _login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


async def test_login_with_username_succeeds(client: AsyncClient) -> None:
    await _register(client)
    response = await _login(client, identifier=REGISTER_PAYLOAD["username"])
    assert response.status_code == 200


async def test_login_wrong_password_rejected(client: AsyncClient) -> None:
    await _register(client)
    response = await _login(client, password="WrongPass123")
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_credentials"


async def test_login_unknown_user_rejected(client: AsyncClient) -> None:
    response = await _login(client, identifier="ghost@amplivo.com", password="WhoKnows123")
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_credentials"


async def test_get_me_requires_token(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)


async def test_get_me_rejects_invalid_token(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_token"


async def test_get_me_returns_current_user(client: AsyncClient) -> None:
    await _register(client)
    login_response = await _login(client)
    access_token = login_response.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == REGISTER_PAYLOAD["email"]


async def test_refresh_token_rotates_and_old_token_fails(client: AsyncClient) -> None:
    await _register(client)
    login_response = await _login(client)
    old_refresh_token = login_response.json()["refresh_token"]

    refresh_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh_token}
    )
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert new_tokens["refresh_token"] != old_refresh_token
    assert new_tokens["access_token"] != login_response.json()["access_token"]

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh_token}
    )
    assert reuse_response.status_code == 401
    assert reuse_response.json()["error_code"] == "token_revoked"


async def test_refresh_rejects_garbage_token(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage-token"})
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_token"


async def test_logout_revokes_refresh_token(client: AsyncClient) -> None:
    await _register(client)
    login_response = await _login(client)
    refresh_token = login_response.json()["refresh_token"]

    logout_response = await client.post(
        "/api/v1/auth/logout", json={"refresh_token": refresh_token}
    )
    assert logout_response.status_code == 200
    assert logout_response.json()["message"]

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert reuse_response.status_code == 401
    assert reuse_response.json()["error_code"] == "token_revoked"


async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
