from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class NoteCreate(BaseModel):

    title: str = Field(
        min_length=3,
        max_length=100,
        description="Note Title",
        examples=["My First Note"]
    )

    content: str = Field(
        min_length=0,
        max_length=10000000000000000,
        description="Note Content",
        examples=["This is my first note."]
    )

class NoteResponse(BaseModel):

    note_id: int = Field(
        description="User's note ID",
        examples=[9]
    )

    title: str = Field(
        min_length=3,
        max_length=100,
        description="Note Title",
        examples=["My First Note"]
    )

    content: str = Field(
        min_length=1,
        max_length=1000000,
        description="Note Content",
        examples=["This is my first note."]
    )

    owner_id: int = Field(
        examples=[8]
    )

    created_at: datetime
    updated_at: datetime   

    model_config = ConfigDict(from_attributes=True)

class NoteUpdate(BaseModel):

    title: str | None = Field(
        min_length=3,
        max_length=100,
        description="Note Title",
        examples=["My First Note"]
    )

    content: str | None = Field(
        min_length=0,
        max_length=10000000000000000,
        description="Note Content",
        examples=["This is my first note."]
    )