from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
#Calling .recommended() configures pwdlib to use Argon2id,
#  the modern industry-standard hashing algorithm that is 
# memory-hard and resistant to GPU-based cracking.

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password) -> bool:
    return password_hash.verify(password, hashed_password)