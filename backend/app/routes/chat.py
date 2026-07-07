from fastapi import APIRouter, Request

from fastapi.responses import StreamingResponse

import asyncio
import json

from app.models.chat import (
    ChatRequest,
    ChatResponse
)

from app.services.chat_service import ask_llm
from app.services.event_stream import (
    register_client,
    unregister_client,
)

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):

    asyncio.create_task(
        ask_llm(request.message)
    )
    
    return {
        "status": "started"
    }

@router.get("/chat/stream")
async def chat_stream(request: Request):

    queue = await register_client()
    
    async def event_generator():

            try:

                while True:

                    if await request.is_disconnected():
                        print("Client hat Verbindung getrennt")
                        break

                    try:

                        payload = await asyncio.wait_for(
                            queue.get(),
                            timeout=0.5
                        )

                    except asyncio.TimeoutError:
                        continue
                                                        
                    yield (
                        f"data: {json.dumps(payload)}\n\n"
                    )
                    
            finally:

                unregister_client(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
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