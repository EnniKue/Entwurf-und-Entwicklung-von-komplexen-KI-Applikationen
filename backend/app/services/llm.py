from dotenv import load_dotenv
from openai import AsyncOpenAI

import os

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("BASE_URL"),
)

MODEL_NAME = os.getenv("MODEL_NAME")


def build_prompt(
    system_prompt: str,
    conversation_history: list,
    user_message: str,
) -> str:

    prompt = system_prompt

    prompt += "\n\n### Bisherige Unterhaltung ###\n\n"

    for message in conversation_history:
        prompt += (
            f"{message['role'].capitalize()}:\n"
            f"{message['content']}\n\n"
        )

    prompt += "\n### Aktuelle Benutzerfrage ###\n\n"
    prompt += f"Benutzer: {user_message}\n\n"

    prompt += (
        "Beantworte ausschließlich die letzte Benutzerfrage.\n"
        "Setze die Unterhaltung fort.\n"
        "Antwort:\n"
    )

    return prompt


async def call_llm_with_retry(
    system_prompt: str,
    conversation_history: list,
    user_message: str,
):

    prompt = build_prompt(
        system_prompt,
        conversation_history,
        user_message,
    )

    print("Promptlänge:", len(prompt), "Zeichen")
    
    stream = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        stream=True,
    )

    async for chunk in stream:

        token = ""

        if (
            chunk.choices
            and chunk.choices[0].delta.content
        ):
            token = chunk.choices[0].delta.content

        yield {
            "response": token,
            "done": False,
        }

    yield {
        "response": "",
        "done": True,
    }