from pwdlib import PasswordHash
import jwt
from app.core.config import settings
from datetime import datetime, timedelta, timezone

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
        "sub" : user_id,
        "exp" : expire
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        settings.jwt_algorithm
    )