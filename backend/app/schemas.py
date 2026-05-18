from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    youtube_url: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    video_id: str
    video_url: str
    summary: str
    main_topics: list[str]
    pdf_url: str
    pdf_filename: str
