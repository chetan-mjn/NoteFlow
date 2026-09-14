from app.schemas.note import NoteCreate, NoteResponse
from app.models.user import User
from app.models.note import Note
from fastapi import Depends, HTTPException, APIRouter
from app.database.database import get_db
from sqlalchemy.orm import Session
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/notes"
)

@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 
    new_note = Note(
        title = note.title,
        content = note.content,
        owner_id = current_user.user_id
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(Note.note_id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    if note.owner_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this note"
        )

    return note
