from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.models.user import User
from app.models.note import Note
from fastapi import Depends, HTTPException, APIRouter, Query
from app.database.database import get_db
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from sqlalchemy import or_

router = APIRouter(
    prefix="/notes"
)

sort_columns = {
    "created_at" : Note.created_at,
    "updated_at" : Note.updated_at,
    "title" : Note.title
}

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

@router.get("/", response_model=list[NoteResponse])
def get_notes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.owner_id == current_user.user_id)

    if search:
        query = query.filter(
            or_(
                Note.title.ilike(f"%{search}%"),
                Note.content.ilike(f"%{search}%")
            )
        )

    sort_column = sort_columns.get(sort_by)

    if sort_column is None:
        raise HTTPException(
            status_code=422,
            detail="Please choose a valid sort field"
        )

    if order not in ["asc", "desc"]:
        raise HTTPException(
            status_code=422,
            detail="Please a valid sort order: asc or desc"
        )

    if order == "asc":
        query = query.order_by(sort_column.asc())
    elif order == "desc":
        query = query.order_by(sort_column.desc())

    notes = query.offset(skip).limit(limit).all()

    return notes

@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_note = db.query(Note).filter(Note.note_id == note_id).first()

    if not updated_note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    if updated_note.owner_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this note"
        )

    patched_data = note.model_dump(exclude_unset=True)

    for field, value in patched_data.items():

        setattr(updated_note, field, value)

    db.commit()
    db.refresh(updated_note)

    return updated_note

@router.delete("/{note_id}", status_code=204)
def delete_note(
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
            detail="you do not have the permission to delete this note"
        )

    db.delete(note)
    db.commit()

    return