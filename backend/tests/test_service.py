from pathlib import Path
from unittest.mock import patch

import pytest

from app.schemas import AnalyzeResponse
from app.service import analyze_url


class FakeAnalysis:
    """Stand-in for VideoAnalysis with only the fields service.py reads."""
    def __init__(self):
        self.video_id = "abc123"
        self.video_url = "https://www.youtube.com/watch?v=abc123"
        self.summary = "Test summary."
        self.main_topics = ["topic 1", "topic 2"]


@pytest.fixture
def fake_settings(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("EXPORTS_DIR", str(tmp_path))
    from app.settings import get_settings
    get_settings.cache_clear()
    return get_settings()


def test_analyze_url_returns_response_with_pdf(fake_settings, tmp_path):
    pdf_file = tmp_path / "20260517_120000_abc123.pdf"

    with patch("app.service.YouTubeAnalyzer") as mock_analyzer_cls, \
         patch("app.service.export_analysis_pdf", return_value=pdf_file) as mock_export:
        mock_analyzer_cls.return_value.analyze.return_value = FakeAnalysis()

        result = analyze_url("https://www.youtube.com/watch?v=abc123")

    assert isinstance(result, AnalyzeResponse)
    assert result.video_id == "abc123"
    assert result.summary == "Test summary."
    assert result.main_topics == ["topic 1", "topic 2"]
    assert result.pdf_filename == "20260517_120000_abc123.pdf"
    assert result.pdf_url == "/pdfs/20260517_120000_abc123.pdf"

    mock_analyzer_cls.assert_called_once_with(
        api_key="sk-test",
        model="gpt-4o-mini",
        transcription_model="gpt-4o-mini-transcribe",
    )
    mock_export.assert_called_once()
    args, _ = mock_export.call_args
    assert isinstance(args[1], Path)
    assert args[1] == fake_settings.exports_dir


def test_analyze_url_propagates_value_error(fake_settings):
    with patch("app.service.YouTubeAnalyzer") as mock_analyzer_cls:
        mock_analyzer_cls.return_value.analyze.side_effect = ValueError("Unsupported YouTube URL")

        with pytest.raises(ValueError, match="Unsupported"):
            analyze_url("https://example.com/not-a-video")
