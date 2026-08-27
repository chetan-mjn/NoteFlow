from sqlalchemy import String, Column, Integer, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from app.database.database import Base

#this is a SQLAlchemy model

class Note(Base):

    __tablename__ = "notes"

    note_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    owner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    owner = relationship(
        "User",
        back_populates="notes"
    )
