import logging
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.service import analyze_url


LOGGER = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        return analyze_url(request.youtube_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        # Pipeline raises RuntimeError when all transcript paths fail.
        error_id = uuid.uuid4().hex
        LOGGER.exception("Transcript pipeline failed (error_id=%s)", error_id)
        raise HTTPException(
            status_code=502,
            detail="Could not obtain transcript for this video",
        ) from exc
    except Exception:
        # Use JSONResponse instead of HTTPException so the body keeps a flat
        # shape: {"detail": "...", "error_id": "..."}. HTTPException would
        # wrap a dict detail and nest it under "detail".
        error_id = uuid.uuid4().hex
        LOGGER.exception("Unexpected analyze failure (error_id=%s)", error_id)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal error", "error_id": error_id},
        )
