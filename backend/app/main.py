from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.matchmaking import router as matchmaking_router

app = FastAPI(title="Skill Exchange Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matchmaking_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
