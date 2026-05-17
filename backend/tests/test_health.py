from fastapi.testclient import TestClient

from app.main import create_app


def test_health_returns_ok(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    from app.settings import get_settings
    get_settings.cache_clear()

    client = TestClient(create_app())
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
