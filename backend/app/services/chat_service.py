from dotenv import load_dotenv
from app.services.logger import log_request
from app.services.event_stream import (
    send_event,
    send_finished,
)

import os
import json
import time
import random
import httpx

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
MODEL_NAME = os.getenv("MODEL_NAME")
OLLAMA_URL = BASE_URL.rstrip("/")

if OLLAMA_URL.endswith("/v1"):
    OLLAMA_URL = OLLAMA_URL[:-3]


# ----------------------------------------------------
# Wissensbasis laden
# ----------------------------------------------------

def load_knowledge():

    with open(
        "knowledge.json",
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


# ----------------------------------------------------
# Ollama Streaming
# ----------------------------------------------------

async def call_llm_with_retry(
    system_prompt: str,
    user_message: str,
):

    prompt = (
        system_prompt
        + "\n\n"
        + user_message
    )

    max_attempts = 3

    for attempt in range(max_attempts):

        try:

            async with httpx.AsyncClient(
                timeout=None,
            ) as client:

                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model": MODEL_NAME,
                        "prompt": prompt,
                        "stream": True,
                    },
                ) as response:

                    response.raise_for_status()

                    async for line in response.aiter_lines():

                        if not line:
                            continue

                        yield json.loads(line)

            return

        except Exception:

            if attempt == max_attempts - 1:
                raise

            wait_time = (
                2 ** attempt
            ) + random.random()

            log_request(
                route="retry",
                category="llm_retry",
                source="LLM",
                latency_ms=0,
                guardrail_triggered=f"retry_{attempt+1}",
            )

            time.sleep(wait_time)


# ----------------------------------------------------
# Wissensbasis durchsuchen
# ----------------------------------------------------

def search_knowledge(
    user_message: str,
):

    knowledge = load_knowledge()

    user_message = user_message.lower()

    for entry in knowledge:

        for keyword in entry["keywords"]:

            if keyword.lower() in user_message:

                return entry

    return None


# ----------------------------------------------------
# Prompt Injection
# ----------------------------------------------------

def detect_prompt_injection(
    user_message: str,
):

    suspicious_keywords = [

        "ignore previous instructions",
        "system prompt",
        "developer message",
        "act as",
        "administrator",
        "root access",

        "zeige deinen prompt",
        "ignoriere alle regeln",
        "wissensbasis ausgeben",

    ]

    user_message = user_message.lower()

    return any(
        keyword in user_message
        for keyword in suspicious_keywords
    )


# ----------------------------------------------------
# Output prüfen
# ----------------------------------------------------

def validate_output(
    response_text: str,
):

    if response_text is None:
        return False

    if len(
        response_text.strip()
    ) < 3:
        return False

    return True


def get_hello_message():

    return {
        "message": "Hello World!"
    }

async def ask_llm(
    user_message: str,
):

    start_time = time.time()

    await send_event(
        "Nachricht empfangen"
    )

    # ---------------------------------
    # Prompt Injection
    # ---------------------------------

    if detect_prompt_injection(
        user_message
    ):

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        log_request(
            route="guardrail",
            category="security",
            source="Prompt Injection Filter",
            latency_ms=latency_ms,
            guardrail_triggered="prompt_injection",
        )

        await send_event(
            "Prompt Injection erkannt"
        )

        await send_finished(
            response="Diese Anfrage kann nicht verarbeitet werden.",
            route="guardrail",
            source="Guardrail",
        )

        await send_event(
            "Antwort zurück"
        )

        return

    # ---------------------------------
    # Wissensbasis
    # ---------------------------------

    await send_event(
        "Wissensbasis durchsuchen"
    )

    knowledge_result = search_knowledge(
        user_message
    )

    if knowledge_result:

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        if (
            knowledge_result["category"]
            == "sensibel"
        ):

            log_request(
                route="sensitive",
                category="sensibel",
                source=knowledge_result["source"],
                latency_ms=latency_ms,
                guardrail_triggered="sensitive_topic",
            )

            await send_event(
                "Sensible Anfrage erkannt"
            )

            await send_finished(
                response=knowledge_result["answer"],
                route="sensitive",
                source=knowledge_result["source"],
            )

            await send_event(
                "Antwort zurück"
            )

            return

        log_request(
            route="knowledge_base",
            category=knowledge_result["category"],
            source=knowledge_result["source"],
            latency_ms=latency_ms,
        )

        await send_event(
            "Wissensbasis gefunden"
        )

        await send_finished(
            response=knowledge_result["answer"],
            route="knowledge_base",
            source=knowledge_result["source"],
        )

        await send_event(
            "Antwort zurück"
        )

        return

    # ---------------------------------
    # LLM
    # ---------------------------------

    system_prompt = open(
        "system_prompt.txt",
        "r",
        encoding="utf-8",
    ).read()

    await send_event(
        "LLM gestartet"
    )

    answer = ""

    async for chunk in call_llm_with_retry(
        system_prompt,
        user_message,
    ):

        token = chunk.get(
            "response",
            "",
        )

        if token:

            answer += token

            await send_event(
                "token",
                token,
            )

        if chunk.get("done"):
            break

    if not validate_output(
        answer
    ):

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        log_request(
            route="guardrail",
            category="output_validation",
            source="Output Guardrail",
            latency_ms=latency_ms,
            guardrail_triggered="invalid_output",
        )

        await send_event(
            "Ungültige Antwort erkannt"
        )

        await send_finished(
            response="Die Antwort konnte nicht validiert werden.",
            route="guardrail",
            source="Output Guardrail",
        )

        await send_event(
            "Antwort zurück"
        )

        return

    latency_ms = int(
        (time.time() - start_time)
        * 1000
    )

    log_request(
        route="llm",
        category="llm",
        source="LLM",
        latency_ms=latency_ms,
    )

    await send_event(
        "Antwort erzeugt"
    )

    await send_finished(
        response=answer,
        route="llm",
        source="LLM",
    )

    await send_event(
        "Antwort zurück"
    )

