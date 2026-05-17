import pytest
from pydantic import ValidationError

from app.schemas import AnalyzeRequest, AnalyzeResponse


def test_analyze_request_accepts_youtube_url():
    req = AnalyzeRequest(youtube_url="https://www.youtube.com/watch?v=abc")
    assert req.youtube_url == "https://www.youtube.com/watch?v=abc"


def test_analyze_request_rejects_empty_url():
    with pytest.raises(ValidationError):
        AnalyzeRequest(youtube_url="")


def test_analyze_response_round_trips():
    payload = {
        "video_id": "abc123",
        "video_url": "https://www.youtube.com/watch?v=abc123",
        "summary": "A short summary.",
        "main_topics": ["t1", "t2"],
        "pdf_url": "/pdfs/20260517_120000_abc123.pdf",
        "pdf_filename": "20260517_120000_abc123.pdf",
    }
    resp = AnalyzeResponse(**payload)
    assert resp.model_dump() == payload
