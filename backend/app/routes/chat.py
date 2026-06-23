from fastapi import APIRouter

from fastapi.responses import StreamingResponse
import json
import asyncio

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

    result = ask_llm(request.message)

    return ChatResponse(
        response=result["response"],
        source=result["source"],
        route=result["route"]
    )

@router.get("/chat/stream")
async def chat_stream():

    async def event_generator():

        yield f"data: {json.dumps({'event': 'Nachricht empfangen'})}\n\n"

        await asyncio.sleep(1)

        yield f"data: {json.dumps({'event': 'Anfrage gestartet'})}\n\n"

        await asyncio.sleep(1)

        yield f"data: {json.dumps({'event': 'Antwort erhalten'})}\n\n"

        await asyncio.sleep(1)

        yield f"data: {json.dumps({'event': 'Antwort angezeigt'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )