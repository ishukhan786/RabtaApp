import datetime
import os
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Support DATABASE_URL environment variable for production (e.g., PostgreSQL), fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rabta_live.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserInDB(BaseModel):
    name: Optional[str] = None
    username: str
    email: Optional[str] = None
    bio: Optional[str] = "Hey there! I am using RaabtaApp."
    avatar: Optional[str] = ""
    password_hash: str
    created_at: str

class MessageInDB(BaseModel):
    id: str
    sender: str
    recipient: str
    text: str
    timestamp: str

# Import models after Base is defined to avoid circular imports
import models

def init_db():
    """Create database tables and seed initial users for easy testing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            from auth import hash_password
            users = [
                models.User(username="ishtiaq", name="Ishtiaq Khan", bio="Senior Full Stack Engineer 🚀", avatar="👨‍💻", password_hash=hash_password("password123"), created_at=datetime.datetime.utcnow().isoformat()),
                models.User(username="ali", name="Ali Raza", bio="Exploring AI & WebSockets 🤖", avatar="🚀", password_hash=hash_password("password123"), created_at=datetime.datetime.utcnow().isoformat()),
                models.User(username="sara", name="Sara Ahmed", bio="UI/UX Designer ✨", avatar="🎨", password_hash=hash_password("password123"), created_at=datetime.datetime.utcnow().isoformat())
            ]
            db.add_all(users)
            db.commit()
    finally:
        db.close()

init_db()

def get_user(username: str) -> Optional[UserInDB]:
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            return UserInDB(name=user.name, username=user.username, email=user.email, bio=user.bio, avatar=user.avatar, password_hash=user.password_hash, created_at=user.created_at)
        return None
    finally:
        db.close()

def save_user(user_in: UserInDB) -> UserInDB:
    db = SessionLocal()
    try:
        db_user = models.User(
            name=user_in.name,
            username=user_in.username,
            email=user_in.email,
            bio=user_in.bio,
            avatar=user_in.avatar,
            password_hash=user_in.password_hash,
            created_at=user_in.created_at
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return user_in
    finally:
        db.close()

def save_message(message_in: MessageInDB):
    db = SessionLocal()
    try:
        db_msg = models.Message(
            id=message_in.id,
            sender=message_in.sender,
            recipient=message_in.recipient,
            text=message_in.text,
            timestamp=message_in.timestamp
        )
        db.add(db_msg)
        db.commit()
    finally:
        db.close()

def get_messages_for_user(username: str) -> List[MessageInDB]:
    db = SessionLocal()
    try:
        msgs = db.query(models.Message).filter(
            (models.Message.sender == username) | (models.Message.recipient == username)
        ).order_by(models.Message.timestamp).all()
        return [
            MessageInDB(
                id=msg.id,
                sender=msg.sender,
                recipient=msg.recipient,
                text=msg.text,
                timestamp=msg.timestamp
            ) for msg in msgs
        ]
    finally:
        db.close()

def get_all_users() -> List[UserInDB]:
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        return [
            UserInDB(name=u.name, username=u.username, email=u.email, bio=u.bio, avatar=u.avatar, password_hash=u.password_hash, created_at=u.created_at)
            for u in users
        ]
    finally:
        db.close()

def update_user_profile(username: str, name: Optional[str], bio: Optional[str], avatar: Optional[str]) -> Optional[UserInDB]:
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            if name is not None:
                user.name = name
            if bio is not None:
                user.bio = bio
            if avatar is not None:
                user.avatar = avatar
            db.commit()
            db.refresh(user)
            return UserInDB(name=user.name, username=user.username, email=user.email, bio=user.bio, avatar=user.avatar, password_hash=user.password_hash, created_at=user.created_at)
        return None
    finally:
        db.close()
