from fastapi import APIRouter
from app.services.chat_service import get_hello_message

router = APIRouter()

@router.get(
    "/hello",
    summary="Hello-World-Test",
    description="Gibt eine Testnachricht zurück."
)
def hello():
    return get_hello_message()