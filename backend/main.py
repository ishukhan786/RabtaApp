import asyncio
import datetime
import os
import time
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import create_access_token, hash_password, verify_password, verify_token
from database import MessageInDB, UserInDB, get_all_users, get_messages_for_user, get_user, save_message, save_user

app = FastAPI(title="RabtaApp API")

# Load allowed origins from environment variable for easy production configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    username: str
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

@app.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest):
    username = data.username.strip().lower()
    if not username or not data.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    if get_user(username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = UserInDB(
        name=data.name.strip(),
        username=username,
        email=data.email.strip(),
        password_hash=hash_password(data.password),
        created_at=datetime.datetime.utcnow().isoformat()
    )
    save_user(new_user)
    
    token = create_access_token(username=username)
    return AuthResponse(token=token, user={"name": new_user.name, "username": username, "email": new_user.email, "created_at": new_user.created_at})

@app.post("/login", response_model=AuthResponse)
def login(data: AuthRequest):
    username = data.username.strip().lower()
    user = get_user(username)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(username=username)
    return AuthResponse(token=token, user={"name": user.name, "username": username, "email": user.email, "created_at": user.created_at})

@app.get("/users")
def list_users():
    """Return list of all registered users for easy contact selection."""
    return [{"name": u.name, "username": u.username, "email": u.email, "created_at": u.created_at} for u in get_all_users()]

@app.get("/messages/{contact}")
def get_chat_history(contact: str, token: str):
    """Fetch conversation history between current user and a contact."""
    payload = verify_token(token)
    current_user = payload.get("username")
    all_msgs = get_messages_for_user(current_user)
    # Filter messages between current_user and contact
    history = [
        msg.model_dump() for msg in all_msgs 
        if (msg.sender == current_user and msg.recipient == contact) or 
           (msg.sender == contact and msg.recipient == current_user)
    ]
    return history

class ConnectionManager:
    def __init__(self):
        # Maps username -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        self.active_connections[username] = websocket
        # Broadcast user online status
        await self.broadcast({"type": "user_online", "username": username})

    async def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
            # Broadcast user offline status
            await self.broadcast({"type": "user_offline", "username": username})

    async def send_personal_message(self, message: dict, recipient: str):
        websocket = self.active_connections.get(recipient)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception:
                await self.disconnect(recipient)

    async def broadcast(self, message: dict):
        for username, websocket in list(self.active_connections.items()):
            try:
                await websocket.send_json(message)
            except Exception:
                await self.disconnect(username)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    await websocket.accept()
    if not token:
        await websocket.close(code=4000, reason="Missing token")
        return

    try:
        payload = verify_token(token)
    except HTTPException as exc:
        if exc.detail == "Token expired":
            await websocket.close(code=4001, reason="Token expired")
        else:
            await websocket.close(code=4000, reason="Invalid token")
        return

    username = payload.get("username")
    if not username:
        await websocket.close(code=4000, reason="Invalid token payload")
        return

    # Handle auto-disconnect on token expiry while connected
    exp = payload.get("exp")
    time_remaining = (exp - time.time()) if exp else 86400

    async def expiration_watcher():
        if time_remaining > 0:
            await asyncio.sleep(time_remaining)
        await manager.disconnect(username)
        try:
            await websocket.close(code=4001, reason="Token expired")
        except Exception:
            pass

    watcher_task = asyncio.create_task(expiration_watcher())

    await manager.connect(username, websocket)

    # Send current online users list to the newly connected user
    await websocket.send_json({
        "type": "online_users_list",
        "users": list(manager.active_connections.keys())
    })

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "message":
                recipient = data.get("to")
                text = data.get("text")
                if recipient and text:
                    msg_obj = MessageInDB(
                        id=str(uuid.uuid4()),
                        sender=username,
                        recipient=recipient,
                        text=text,
                        timestamp=datetime.datetime.utcnow().isoformat()
                    )
                    save_message(msg_obj)

                    # Send to recipient if online
                    await manager.send_personal_message({
                        "type": "message",
                        "id": msg_obj.id,
                        "from": username,
                        "to": recipient,
                        "text": text,
                        "timestamp": msg_obj.timestamp
                    }, recipient)

            elif msg_type == "typing":
                recipient = data.get("to")
                is_typing = data.get("is_typing", False)
                if recipient:
                    await manager.send_personal_message({
                        "type": "typing",
                        "from": username,
                        "is_typing": is_typing
                    }, recipient)

    except WebSocketDisconnect:
        watcher_task.cancel()
        await manager.disconnect(username)
    except Exception:
        watcher_task.cancel()
        await manager.disconnect(username)
