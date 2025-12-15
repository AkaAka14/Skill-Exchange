from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_client import OllamaClient, GeminiClient, LocalFallbackClient
from services.vector_store import InMemoryVectorStore

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    skills: list[str]



vector_store = InMemoryVectorStore()
ollama = OllamaClient()
gemini = GeminiClient()
fallback = LocalFallbackClient()


@router.post("/match")
async def match(profile: UserProfile):
   
    try:
        embeddings = await ollama.embed_texts(profile.skills)
    except Exception:
        try:
            embeddings = await gemini.embed_texts(profile.skills)
        except Exception:
           
            embeddings = await fallback.embed_texts(profile.skills)

   
    vector_store.upsert(profile.id, embeddings)

  
    results = vector_store.search(embeddings, top_k=5)

    return {"matches": results}
