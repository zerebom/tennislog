run:
	uv run uvicorn tenniscoach_api.main:app --reload --host 0.0.0.0 --port 8000

format:
	uv run ruff format . --config=pyproject.toml

lint:
	uv run ruff check --fix . --config=pyproject.toml

typecheck:
	uv run mypy src/

test:
	uv run pytest

check: format lint typecheck test

sync:
	uv sync --all-extras
