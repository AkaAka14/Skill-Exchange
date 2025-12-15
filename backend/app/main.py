from fastapi import FastAPI
from app.auth.routes import router as auth_router
from app.skills.routes import router as skills_router
from app.matches.routes import router as matches_router

app = FastAPI(title="Skill Exchange Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matchmaking_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")
app.include_router(skills_router, prefix="/skills")
app.include_router(matches_router, prefix="/matches")


@app.get("/health")
async def health():
    return {"status": "ok"}
