from fastapi import FastAPI
from app.routers.auth import authrouter

app = FastAPI(
    title="Note Flow",
    version="1.0.0"
)

app.include_router(authrouter)