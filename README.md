# youtube_pdf_reporter_ui

Web UI for the `youtube_pdf_reporter` CLI.
Paste a YouTube URL, click Analyze, see a short summary + main topics, download the full PDF report.

## Layout
- `backend/` — FastAPI app. Depends on `../youtube_pdf_reporter` as an editable install.
- `frontend/` — Vite + React + TypeScript app.

## Prerequisites
- Python 3.11+
- Node 18+
- A working sibling checkout at `../youtube_pdf_reporter`
- `OPENAI_API_KEY` exported (see `.env.example`)

## Setup
1. `cp .env.example backend/.env` and fill in `OPENAI_API_KEY`.
2. From `backend/`: create a venv, then `pip install -e . -e ../../youtube_pdf_reporter`.
3. From `frontend/`: `npm install`.

## Run (dev)
- `make dev-backend` (port 8000) and in another terminal `make dev-frontend` (port 5173).
- Or `make dev` to run both concurrently.

## Run (prod-like)
- `make build` then `make run`. Single process on `:8000` serves API + frontend.

## Notes
- PDFs are written to `backend/exports/`. Clean up manually: `rm backend/exports/*.pdf`.
