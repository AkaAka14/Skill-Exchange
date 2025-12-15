import os
import httpx
from typing import List
from dotenv import load_dotenv

load_dotenv()
HAS_GENAI = False
try:
    import google.generativeai as genai 
    HAS_GENAI = True
except Exception:
    HAS_GENAI = False


class OllamaClient:

    def __init__(self):
        self.host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "default")

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
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
                    
                    if "embeddings" in data:
                        return data["embeddings"]
                    if "data" in data and isinstance(data["data"], list):
                       
                        first = data["data"]
                     
                        embeddings = []
                        for item in first:
                            if isinstance(item, dict) and "embedding" in item:
                                embeddings.append(item["embedding"])
                        if embeddings:
                            return embeddings
                  
                    raise RuntimeError(f"Unexpected response shape from {url}: {list(data.keys())}")
                except httpx.HTTPStatusError:
                   
                    continue
                except Exception as exc:
                    
                    last_exc = exc
            
            raise RuntimeError(f"Failed to get embeddings from Ollama. Last error: {locals().get('last_exc')}")


class GeminiClient:

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "textembedding-gecko-001")
        if not self.api_key:
            return

        if HAS_GENAI:
            try:
                genai.configure(api_key=self.api_key) 
            except Exception:
         
                try:
                    genai.init(api_key=self.api_key)
                except Exception:
                    pass

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not set — set it in your environment or .env file")

        if not HAS_GENAI:
            raise RuntimeError("google-generativeai SDK not installed. Install with `pip install google-generativeai` to use GeminiClient.")

        try:
            
            resp = genai.embeddings.create(model=self.model, input=texts) 
            embeddings = []
            if hasattr(resp, "data"):
                for item in resp.data:
                  
                    if isinstance(item, dict) and "embedding" in item:
                        embeddings.append(item["embedding"])
                    elif hasattr(item, "embedding"):
                        embeddings.append(item.embedding)
          
            if not embeddings and isinstance(resp, dict) and "embeddings" in resp:
                embeddings = resp["embeddings"]
            if not embeddings:
                raise RuntimeError("Gemini SDK returned no embeddings; inspect response shape")
            return embeddings
        except Exception as exc:
            raise RuntimeError(f"Gemini embeddings request failed: {exc}")


class LocalFallbackClient:
  
    def __init__(self, dim: int = 64):
        self.dim = dim

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        import hashlib

        embeddings: List[List[float]] = []
        for t in texts:
            h = hashlib.sha256(t.encode("utf-8")).digest()
    
            vals = []
            i = 0
            while len(vals) < self.dim:
                vals.append(h[i % len(h)])
                i += 1
            
            arr = [(v / 255.0) * 2 - 1 for v in vals]
            embeddings.append(arr)
        return embeddings
