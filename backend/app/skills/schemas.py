from pydantic import BaseModel


class SkillCreate(BaseModel):
    user_id: str
    skill: str
    type: str # OFFER or WANT


class SkillResponse(BaseModel):
    id: str
    user_id: str
    skill: str
    type: str