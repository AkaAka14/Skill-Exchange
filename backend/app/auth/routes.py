from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from app.database import db
from app.auth.jwt import create_access_token


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register")
def register(user: dict):
user["password"] = pwd_context.hash(user["password"])
db.users.insert_one(user)
return {"message": "User registered"}


@router.post("/login")
def login(user: dict):
db_user = db.users.find_one({"email": user["email"]})
if not db_user or not pwd_context.verify(user["password"], db_user["password"]):
raise HTTPException(status_code=401, detail="Invalid credentials")


token = create_access_token({"sub": str(db_user["_id"])})
return {"access_token": token}