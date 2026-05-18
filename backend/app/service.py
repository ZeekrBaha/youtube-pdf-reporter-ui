from youtube_pdf_reporter.youtube.pdf_export import export_analysis_pdf
from youtube_pdf_reporter.youtube.pipeline import YouTubeAnalyzer

from app.schemas import AnalyzeResponse
from app.settings import get_settings


def analyze_url(youtube_url: str) -> AnalyzeResponse:
    settings = get_settings()
    analyzer = YouTubeAnalyzer(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        transcription_model=settings.openai_transcription_model,
    )
    analysis = analyzer.analyze(youtube_url)
    pdf_path = export_analysis_pdf(analysis, settings.exports_dir)
    return AnalyzeResponse(
        video_id=analysis.video_id,
        video_url=str(analysis.video_url),
        summary=analysis.summary,
        main_topics=list(analysis.main_topics),
        pdf_url=f"/pdfs/{pdf_path.name}",
        pdf_filename=pdf_path.name,
    )
