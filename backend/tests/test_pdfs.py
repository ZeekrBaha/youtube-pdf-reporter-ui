from fastapi.testclient import TestClient

from app.main import create_app


def test_pdfs_returns_file_when_present(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("EXPORTS_DIR", str(tmp_path))
    from app.settings import get_settings
    get_settings.cache_clear()

    pdf = tmp_path / "sample.pdf"
    pdf.write_bytes(b"%PDF-1.4\n%FAKE\n")

    client = TestClient(create_app())
    response = client.get("/pdfs/sample.pdf")

    assert response.status_code == 200
    assert response.content.startswith(b"%PDF-")


def test_pdfs_returns_404_for_missing(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("EXPORTS_DIR", str(tmp_path))
    from app.settings import get_settings
    get_settings.cache_clear()

    client = TestClient(create_app())
    response = client.get("/pdfs/missing.pdf")

    assert response.status_code == 404
