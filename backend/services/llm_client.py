import os
import httpx
from typing import List
from dotenv import load_dotenv

load_dotenv()

# Try to import the official Google Generative AI SDK (Gemini) if installed.
HAS_GENAI = False
try:
    import google.generativeai as genai  # type: ignore
    HAS_GENAI = True
except Exception:
    HAS_GENAI = False


class OllamaClient:
    """Wrapper for contacting a local Ollama instance.

    Notes:
    - Ollama exposes an HTTP API when the local daemon is running. The exact
      endpoints may vary by Ollama version; this wrapper tries common paths
      and raises descriptive errors on failure.
    - Configure `OLLAMA_HOST` and `OLLAMA_MODEL` in env.
    """

    def __init__(self):
        self.host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "default")

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Return embeddings for a list of texts using Ollama HTTP API.

        This implementation attempts a couple of reasonable endpoints and
        returns the `embeddings` field from the response JSON. If the
        endpoint differs for your Ollama installation, update this wrapper.
        """
        # Candidate endpoints used by different versions/consumers
        candidates = [
            f"{self.host}/embed",
            f"{self.host}/embeddings",
            f"{self.host}/api/embed",
            f"{self.host}/api/embeddings",
        ]

        async with httpx.AsyncClient() as client:
            for url in candidates:
                try:
                    resp = await client.post(url, json={"model": self.model, "texts": texts}, timeout=30)
                    if resp.status_code == 404:
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    # Common field names: 'embeddings' or 'data'
                    if "embeddings" in data:
                        return data["embeddings"]
                    if "data" in data and isinstance(data["data"], list):
                        # Attempt to map nested structure
                        first = data["data"]
                        # support structures like [{'embedding': [...]}, ...]
                        embeddings = []
                        for item in first:
                            if isinstance(item, dict) and "embedding" in item:
                                embeddings.append(item["embedding"])
                        if embeddings:
                            return embeddings
                    # if we get here, content isn't in expected shape -> raise
                    raise RuntimeError(f"Unexpected response shape from {url}: {list(data.keys())}")
                except httpx.HTTPStatusError:
                    # try next candidate
                    continue
                except Exception as exc:
                    # bubble up if none of the endpoints worked
                    last_exc = exc
            # If loop finishes without return, raise last seen error
            raise RuntimeError(f"Failed to get embeddings from Ollama. Last error: {locals().get('last_exc')}")


class GeminiClient:
    """Client for obtaining embeddings from Gemini (Google Generative AI).

    Behavior:
    - If the official `google.generativeai` SDK is installed, it will be used.
    - Otherwise this client raises an error requesting the SDK be installed.
    - Configure `GEMINI_API_KEY` and optional `GEMINI_MODEL` in env.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "textembedding-gecko-001")
        if not self.api_key:
            # we don't raise here to allow attempted fallbacks, but methods will
            # raise if no key is provided and SDK is required.
            return

        if HAS_GENAI:
            # Configure the SDK with the API key
            try:
                genai.configure(api_key=self.api_key)  # type: ignore
            except Exception:
                # some versions use a different configure function
                try:
                    genai.init(api_key=self.api_key)  # type: ignore
                except Exception:
                    pass

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not set — set it in your environment or .env file")

        if not HAS_GENAI:
            raise RuntimeError("google-generativeai SDK not installed. Install with `pip install google-generativeai` to use GeminiClient.")

        # Use the SDK if available. The public API may change; we attempt a
        # commonly used call signature and raise a readable error if it fails.
        try:
            # Typical usage: genai.embeddings.create(model=..., input=texts)
            resp = genai.embeddings.create(model=self.model, input=texts)  # type: ignore
            # Response typically contains `data` with `embedding` entries
            embeddings = []
            if hasattr(resp, "data"):
                for item in resp.data:
                    # item may be an object or dict
                    if isinstance(item, dict) and "embedding" in item:
                        embeddings.append(item["embedding"])
                    elif hasattr(item, "embedding"):
                        embeddings.append(item.embedding)
            # Fallback: resp.get('embeddings')
            if not embeddings and isinstance(resp, dict) and "embeddings" in resp:
                embeddings = resp["embeddings"]
            if not embeddings:
                raise RuntimeError("Gemini SDK returned no embeddings; inspect response shape")
            return embeddings
        except Exception as exc:
            raise RuntimeError(f"Gemini embeddings request failed: {exc}")


class LocalFallbackClient:
    """Deterministic local embedding generator used as a last-resort fallback.

    This produces a fixed-length vector per input by hashing the text. It is
    intended for local development and tests when neither Ollama nor Gemini
    are available.
    """

    def __init__(self, dim: int = 64):
        self.dim = dim

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        import hashlib

        embeddings: List[List[float]] = []
        for t in texts:
            h = hashlib.sha256(t.encode("utf-8")).digest()
            # Expand or trim digest to desired dim by repeating the digest
            vals = []
            i = 0
            while len(vals) < self.dim:
                vals.append(h[i % len(h)])
                i += 1
            # Normalize bytes to floats in [-1,1]
            arr = [(v / 255.0) * 2 - 1 for v in vals]
            embeddings.append(arr)
        return embeddings
