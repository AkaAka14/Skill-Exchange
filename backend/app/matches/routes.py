from fastapi import APIRouter
from app.matches.service import vector_search


router = APIRouter()


@router.get("/")
def get_matches(skill: str):
    return vector_search(skill)