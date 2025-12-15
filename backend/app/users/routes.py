from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import db
from app.users.schemas import UserResponse


router = APIRouter()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")


    return UserResponse(
    id=str(user["_id"]),
    name=user["name"],
    email=user["email"],
    bio=user.get("bio")
    )