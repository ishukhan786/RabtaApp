from fastapi import APIRouter

from app.schemas.message import MessageCreate

router = APIRouter()


@router.get("/{chat_id}")
def list_messages(chat_id: int):
    return [{"id": 1, "chat_id": chat_id, "sender_id": 1, "content": "Hello"}]


@router.post("/")
def create_message(payload: MessageCreate):
    return {"message": "Message created", "data": payload}
