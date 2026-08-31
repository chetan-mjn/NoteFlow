from pwdlib import PasswordHash
import jwt
from app.core.config import settings
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException

password_hash = PasswordHash.recommended()
#Calling .recommended() configures pwdlib to use Argon2id,
#  the modern industry-standard hashing algorithm that is 
# memory-hard and resistant to GPU-based cracking.

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password) -> bool:
    return password_hash.verify(password, hashed_password)

def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiration_time)

    payload = {
        "sub" : str(user_id),
        "exp" : expire
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_token(
        token: str = Depends(oauth2_scheme)
) -> int:

    try:
        payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm]
    )
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized access"
        )

    return int(payload["sub"])