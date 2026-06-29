from fastapi import APIRouter

from fastapi.responses import StreamingResponse
import json

from app.models.chat import (
    ChatRequest,
    ChatResponse
)

from app.services.chat_service import ask_llm
from app.services.event_stream import get_event

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat mit dem LLM",
    description="Sendet eine Nutzernachricht an das Sprachmodell."
)
async def chat(request: ChatRequest):

    result = await ask_llm(request.message)

    return ChatResponse(
        response=result["response"],
        source=result["source"],
        route=result["route"]
    )

@router.get("/chat/stream")
async def chat_stream():

    async def event_generator():

        while True:

            event = await get_event()

            yield (
                f"data: {json.dumps({'event': event})}\n\n"
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@router.get(
    "/status",
    summary="Backend-Status",
    description="Prüft, ob das Backend erreichbar ist."
)
def status():

    return {
        "status": "ok",
        "service": "Coding Assistant",
        "version": "1.0"
    }