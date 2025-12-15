from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    bio: str | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    bio: str | None = None