from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.hello import router as hello_router
from app.routes.chat import router as chat_router

app = FastAPI(
    title="Coding Assistant API",
    description="Backend für den Coding-Assistenten",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    hello_router,
    prefix="/api",
    tags=["Hello"]
)

app.include_router(
    chat_router,
    prefix="/api",
    tags=["Chat"]
)

@app.get("/")
def root():
    return {"message": "API läuft"}