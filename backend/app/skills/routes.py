from fastapi import APIRouter
from app.database import db
from app.ai.embeddings import generate_embedding


router = APIRouter()


@router.post("/add")
def add_skill(skill: dict):
    embedding = generate_embedding(skill["skill"])
    db.skills.insert_one({
    **skill,
    "embedding": embedding
    })
    return {"message": "Skill added"}