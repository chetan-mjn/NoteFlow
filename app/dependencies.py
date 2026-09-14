from app.core.security import verify_token
from fastapi import Depends, HTTPException
from app.database.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User

def get_current_user(
    user_id : int = Depends(verify_token),
    db : Session = Depends(get_db)
):
    current_user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="User not found while authenticating"
        )

    return current_user