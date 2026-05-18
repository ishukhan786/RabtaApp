from pydantic import BaseModel
from fastapi import APIRouter, Depends

from auth import get_current_user_id

router = APIRouter()


class MessageCreate(BaseModel):
    chat_id: int
    text: str


@router.post("/")
def send_message(payload: MessageCreate, user_id: int = Depends(get_current_user_id)):
    return {
        "message": "Message accepted",
        "data": {
            "chat_id": payload.chat_id,
            "text": payload.text,
            "sender_id": user_id,
        },
    }
