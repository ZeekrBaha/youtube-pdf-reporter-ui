import os
import pytest

from app.settings import Settings


def test_settings_reads_required_openai_key(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-123")
    monkeypatch.delenv("OPENAI_MODEL", raising=False)

    settings = Settings()

    assert settings.openai_api_key == "sk-test-123"
    assert settings.openai_model == "gpt-4o-mini"
    assert settings.openai_transcription_model == "gpt-4o-mini-transcribe"
    assert settings.cors_origins == ["http://localhost:5173"]


def test_settings_missing_key_raises(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    # _env_file=None bypasses backend/.env so the test is deterministic even
    # when a developer has a local .env with a placeholder key.
    with pytest.raises(Exception):
        Settings(_env_file=None)


def test_settings_exports_dir_is_absolute(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("EXPORTS_DIR", str(tmp_path / "out"))

    settings = Settings()

    assert settings.exports_dir.is_absolute()
    assert settings.exports_dir.name == "out"
