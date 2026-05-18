.PHONY: dev dev-backend dev-frontend build run test test-backend test-frontend

# Use the backend venv's binaries directly so targets work without an active venv.
VENV_BIN := backend/.venv/bin

dev-backend:
	cd backend && .venv/bin/uvicorn --factory app.main:create_app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	npx concurrently -n backend,frontend -c blue,green \
		"cd backend && .venv/bin/uvicorn --factory app.main:create_app --reload --port 8000" \
		"cd frontend && npm run dev"

build:
	cd frontend && npm run build

run:
	cd backend && .venv/bin/uvicorn --factory app.main:create_app --port 8000

test-backend:
	cd backend && .venv/bin/pytest -v

test-frontend:
	cd frontend && npm test -- --run

test: test-backend test-frontend
