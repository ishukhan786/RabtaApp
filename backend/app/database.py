import os

from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/whatsapp_clone")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client.whatsapp_clone


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
