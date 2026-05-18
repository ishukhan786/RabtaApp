from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, chats, groups, media, messages, users

app = FastAPI(title="WhatsApp Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(chats.router, prefix="/api/chats", tags=["chats"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(media.router, prefix="/api/media", tags=["media"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
