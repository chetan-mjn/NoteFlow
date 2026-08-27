from sqlalchemy import String, Integer, Column, DateTime, func
from app.database.database import Base
from sqlalchemy.orm import relationship

#this is a SQLAlchemy model

class User(Base):

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    notes = relationship(
        "Note",
        back_populates="owner"
    )

