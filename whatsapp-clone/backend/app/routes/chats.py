from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_chats():
    return [{"id": 1, "name": "Family Group", "type": "group"}]
