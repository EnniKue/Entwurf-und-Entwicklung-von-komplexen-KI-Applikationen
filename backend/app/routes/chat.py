from fastapi import APIRouter

from app.models.chat import (
    ChatRequest,
    ChatResponse
)

from app.services.chat_service import ask_llm

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat mit dem LLM",
    description="Sendet eine Nutzernachricht an das Sprachmodell."
)
def chat(request: ChatRequest):

    answer = ask_llm(request.message)

    return ChatResponse(
        response=answer
    )