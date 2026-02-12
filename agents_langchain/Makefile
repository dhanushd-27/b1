server-up:
	uvicorn src.main:app --reload --port 8027

server-down:
	@echo "Server is running on port 8000"
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true