import re

from httpx import AsyncClient

from app.dependencies.db import get_db
from app.main import app

_LATENCY_PATTERN = re.compile(r"^\d+\.\d{2} ms$")


class _FailingSession:
    async def execute(self, *args, **kwargs):
        raise RuntimeError("simulated database failure")


async def _failing_get_db():
    yield _FailingSession()


async def test_liveness_health_check_never_touches_database(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_database_health_check_reports_healthy(client: AsyncClient) -> None:
    response = await client.get("/health/database")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["database"] == "connected"
    assert _LATENCY_PATTERN.match(body["latency"])


async def test_database_health_check_reports_unhealthy_on_failure(client: AsyncClient) -> None:
    original_override = app.dependency_overrides[get_db]
    app.dependency_overrides[get_db] = _failing_get_db
    try:
        response = await client.get("/health/database")
    finally:
        app.dependency_overrides[get_db] = original_override

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "unhealthy"
    assert body["database"] == "disconnected"
    assert _LATENCY_PATTERN.match(body["latency"])
