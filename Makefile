.PHONY: dev dev-backend dev-frontend build run test test-backend test-frontend

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	npx concurrently -n backend,frontend -c blue,green \
		"cd backend && uvicorn app.main:app --reload --port 8000" \
		"cd frontend && npm run dev"

build:
	cd frontend && npm run build

run:
	cd backend && uvicorn app.main:app --port 8000

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm test -- --run

test: test-backend test-frontend
