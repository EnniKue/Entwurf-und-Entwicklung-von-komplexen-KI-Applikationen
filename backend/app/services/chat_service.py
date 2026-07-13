from dotenv import load_dotenv
from app.services.logger import log_request
from app.services.llm import call_llm_with_retry
from app.services.event_stream import (
    send_event,
    send_finished,
)

import os
import time
import json

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
MODEL_NAME = os.getenv("MODEL_NAME")
OLLAMA_URL = BASE_URL.rstrip("/")

if OLLAMA_URL.endswith("/v1"):
    OLLAMA_URL = OLLAMA_URL[:-3]

# ----------------------------------------------------
# Conversation Memory
# ----------------------------------------------------

conversation_history = []


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




# ----------------------------------------------------
# Wissensbasis durchsuchen
# ----------------------------------------------------

def search_knowledge(
    user_message: str,
):
    knowledge = load_knowledge()

    user_message = user_message.lower()

    best_entry = None
    best_score = 0

    for entry in knowledge:

        score = 0

        for keyword in entry["keywords"]:

            keyword = keyword.lower()

            # Mehrwort-Keyword
            if " " in keyword:

                words = keyword.split()

                matched_words = 0

                for word in words:

                    if word in user_message:
                        matched_words += 1

                # Für jedes gefundene Wort einen Punkt
                score += matched_words

                # Bonus, wenn alle Wörter gefunden wurden
                if matched_words == len(words):
                    score += 2

            # Einzelwort
            else:

                if keyword in user_message:
                    score += 1

        if score > best_score:
            best_score = score
            best_entry = entry

    # Sensible Themen bereits bei einem eindeutigen Treffer erkennen
    if (
        best_entry
        and best_entry["category"] == "sensibel"
        and best_score >= 1
    ):
        return best_entry

     # Alle anderen Antworten benötigen mindestens zwei Punkte
    if best_score >= 2:
        return best_entry

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

    conversation_history.append(
        {
            "role": "user",
            "content": user_message,
        }
    )

    # Nur die letzten 20 Nachrichten behalten
    if len(conversation_history) > 20:
        conversation_history[:] = conversation_history[-20:]

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
        conversation_history,
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

    conversation_history.append(
        {
            "role": "assistant",
            "content": answer,
        }
    )

    if len(conversation_history) > 20:
        conversation_history[:] = conversation_history[-20:]

    await send_event(
        "Antwort zurück"
    )

