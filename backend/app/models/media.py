from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    url = Column(String(500), nullable=False)
    media_type = Column(String(80), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
