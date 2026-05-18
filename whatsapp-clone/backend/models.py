from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(String(80), nullable=False)

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(80), primary_key=True, index=True)
    sender = Column(String(80), index=True, nullable=False)
    recipient = Column(String(80), index=True, nullable=False)
    text = Column(String(1000), nullable=False)
    timestamp = Column(String(80), nullable=False)
