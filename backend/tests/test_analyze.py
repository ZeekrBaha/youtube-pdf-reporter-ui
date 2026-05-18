from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas import AnalyzeResponse


def _client(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("EXPORTS_DIR", str(tmp_path))
    from app.settings import get_settings
    get_settings.cache_clear()
    return TestClient(create_app())


def _ok_response():
    return AnalyzeResponse(
        video_id="abc",
        video_url="https://www.youtube.com/watch?v=abc",
        summary="s",
        main_topics=["a", "b"],
        pdf_url="/pdfs/file.pdf",
        pdf_filename="file.pdf",
    )


def test_analyze_returns_200_with_payload(monkeypatch, tmp_path):
    client = _client(monkeypatch, tmp_path)

    with patch("app.api.analyze_url", return_value=_ok_response()) as mock_call:
        response = client.post(
            "/api/analyze",
            json={"youtube_url": "https://www.youtube.com/watch?v=abc"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["video_id"] == "abc"
    assert body["pdf_url"] == "/pdfs/file.pdf"
    mock_call.assert_called_once_with("https://www.youtube.com/watch?v=abc")


def test_analyze_invalid_url_returns_400(monkeypatch, tmp_path):
    client = _client(monkeypatch, tmp_path)

    with patch("app.api.analyze_url", side_effect=ValueError("Unsupported YouTube URL")):
        response = client.post(
            "/api/analyze",
            json={"youtube_url": "https://example.com/x"},
        )

    assert response.status_code == 400
    assert response.json() == {"detail": "Unsupported YouTube URL"}


def test_analyze_unexpected_error_returns_500_with_error_id(monkeypatch, tmp_path):
    client = _client(monkeypatch, tmp_path)

    with patch("app.api.analyze_url", side_effect=Exception("boom")):
        response = client.post(
            "/api/analyze",
            json={"youtube_url": "https://www.youtube.com/watch?v=abc"},
        )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"] == "Internal error"
    assert "error_id" in body and len(body["error_id"]) > 0


def test_analyze_missing_body_returns_422(monkeypatch, tmp_path):
    client = _client(monkeypatch, tmp_path)
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422
