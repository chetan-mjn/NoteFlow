from fastapi import FastAPI

app = FastAPI(
    title="Note Flow",
    version="1.0.0"
)

@app.get("/")
def hello():
    return {
        "message" : "Note Flow is running"
    }