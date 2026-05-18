from fastapi import APIRouter

from app.schemas.group import GroupCreate

router = APIRouter()


@router.post("/")
def create_group(payload: GroupCreate):
    return {"message": "Group created", "group": payload}
