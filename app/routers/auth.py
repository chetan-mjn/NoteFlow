from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.database.database import get_db
from app.models import User
from app.core.security import hash_password, verify_password, create_access_token, verify_token

from fastapi.security import OAuth2PasswordRequestForm

authrouter = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@authrouter.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        (User.username == user.username) |
        (User.email == user.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@authrouter.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm),
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == form.username
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(form.password, existing_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(existing_user.user_id)

    return {
        "access_token" : access_token,
        "token_type" : "bearer"
    }

#test endpoint
@authrouter.post("/verify_user")
def verify_user(
    user_id: int = Depends(verify_token)
):
    return user_id