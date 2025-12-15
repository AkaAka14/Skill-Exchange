# Backend — Skill Exchange

This folder contains a minimal FastAPI backend scaffold that demonstrates how the project integrates with Ollama (local LLM) and Gemini (cloud embeddings) and a tiny in-memory vector store.

Quick start (PowerShell)

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints
- `GET /health` — health check
- `POST /api/match` — matchmaking endpoint; POST a JSON object with `id` and `skills` (array of strings)

Notes
- The `services/llm_client.py` contains simplified stubs for Ollama and Gemini. Update the HTTP paths and auth as required by your deployment.
- The `services/llm_client.py` file now contains:
	- `OllamaClient`: a wrapper that attempts a few reasonable HTTP endpoints for a local Ollama instance; adjust `OLLAMA_HOST`/`OLLAMA_MODEL` in your `.env`.
	- `GeminiClient`: integrates with the Google Generative AI (Gemini) SDK if installed (`pip install google-generativeai`) and requires `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in env.

Gemini SDK notes
- If you intend to use Gemini via the official SDK, install it in the backend venv:

```powershell
pip install google-generativeai
```

Set `GEMINI_API_KEY` and optional `GEMINI_MODEL` in `.env` (see `.env.example`). The Gemini client will attempt to use the SDK if present, and will otherwise raise a helpful error indicating the SDK is required.

Local fallback
- For quick local development or CI where Ollama and Gemini are not available, the backend includes a deterministic `LocalFallbackClient` that produces stable pseudo-embeddings from text. This allows the `/api/match` endpoint to function without external services.
- The vector store is an in-memory demo in `services/vector_store.py`. Replace with a persistent/vector DB for production.
