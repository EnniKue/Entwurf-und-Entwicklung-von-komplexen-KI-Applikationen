from openai import OpenAI
from dotenv import load_dotenv
from app.services.logger import log_request

import os
import json
import time
import random

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

def load_knowledge():

    with open(
        "knowledge.json",
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)

def call_llm_with_retry(
    system_prompt: str,
    user_message: str
):

    max_attempts = 3

    for attempt in range(max_attempts):

        try:

            return client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )

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
                guardrail_triggered=
                    f"retry_attempt_{attempt + 1}"
            )

            time.sleep(wait_time)
    
def search_knowledge(user_message: str):

    knowledge = load_knowledge()

    user_message = user_message.lower()

    for entry in knowledge:

        for keyword in entry["keywords"]:

            if keyword.lower() in user_message:

                return entry

    return None

def detect_prompt_injection(
    user_message: str
):

    suspicious_keywords = [
        "ignore previous instructions",
        "system prompt",
        "zeige deinen prompt",
        "ignoriere alle regeln",
        "developer message",
        "act as",
        "administrator",
        "root access",
        "wissensbasis ausgeben"
    ]

    user_message = user_message.lower()

    for keyword in suspicious_keywords:

        if keyword in user_message:
            return True

    return False

def validate_output(
    response_text: str
):

    if response_text is None:
        return False

    if len(
        response_text.strip()
    ) < 3:
        return False

    return True

def get_hello_message():
    return {"message": "Hello World!"}


def ask_llm(user_message: str):
    start_time = time.time()

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
            guardrail_triggered="prompt_injection"
        )

        return {
            "response":
                "Diese Anfrage kann nicht verarbeitet werden.",
            "source":
                "Guardrail",
            "route":
                "guardrail"
        }

    knowledge_result = search_knowledge(
        user_message
    )

    if knowledge_result:

        if (
            knowledge_result["category"]
            == "sensibel"
        ):
            latency_ms = int(
                (time.time() - start_time)
                * 1000
            )

            log_request(
                route="sensitive",
                category="sensibel",
                source=knowledge_result["source"],
                latency_ms=latency_ms,
                guardrail_triggered="sensitive_topic"
            )
            
            return {
                "response": knowledge_result["answer"],
                "source": knowledge_result["source"],
                "route": "sensitive"
            }

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        log_request(
            route="knowledge_base",
            category=knowledge_result["category"],
            source=knowledge_result["source"],
            latency_ms=latency_ms
        )
        
        return {
            "response": knowledge_result["answer"],
            "source": knowledge_result["source"],
            "route": "knowledge_base"
        }

    system_prompt = open(
        "system_prompt.txt",
        "r",
        encoding="utf-8"
    ).read()

    try:

        response = call_llm_with_retry(
            system_prompt, 
            user_message
        )

    except Exception as e:

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        log_request(
            route="llm",
            category="unknown",
            source="LLM",
            latency_ms=latency_ms,
            status="error",
            error=str(e)
        )

        raise

    answer = (
        response.choices[0]
        .message.content
    )

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
            guardrail_triggered="invalid_output"
        )

        return {
            "response":
                "Die Antwort konnte nicht validiert werden.",
            "source":
                "Output Guardrail",
            "route":
                "guardrail"
        }

    latency_ms = int(
        (time.time() - start_time)
         * 1000
    )

    log_request(
        route="llm",
        category="unknown",
        source="LLM",
        latency_ms=latency_ms
    )

    return {
        "response": answer,
        "source": "LLM",
        "route": "llm"
    }