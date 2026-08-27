from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class UserCreate(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=100,
        description="User's name",
        examples=["Abhyansh Sharma"]
    )
    email: str = Field(
        min_length=8,
        max_length=122,
        description="User's email",
        examples=["noteflowuser@example.com"]
    )
    password: str = Field(
        min_length=8,
        max_length=20,
        description="user's password",
        examples=["myStrongPassword"]
    )

class UserResponse(BaseModel):

    user_id: int = Field(
        description="User's user ID",
        examples=[9]
    )

    username: str = Field(
        min_length=3,
        max_length=100,
        description="User's name",
        examples=["Abhyansh Sharma"]
    )

    email: str = Field(
        min_length=8,
        max_length=122,
        description="User's email",
        examples=["noteflowuser@example.com"]
    )

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)