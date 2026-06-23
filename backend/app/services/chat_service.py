from openai import OpenAI
from dotenv import load_dotenv
import os
import json

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
    
def search_knowledge(user_message: str):

    knowledge = load_knowledge()

    user_message = user_message.lower()

    for entry in knowledge:

        for keyword in entry["keywords"]:

            if keyword.lower() in user_message:

                return entry

    return None

def get_hello_message():
    return {"message": "Hello World!"}


def ask_llm(user_message: str):

    knowledge_result = search_knowledge(
        user_message
    )

    if knowledge_result:

        if (
            knowledge_result["category"]
            == "sensibel"
        ):
            return {
                "response": knowledge_result["answer"],
                "source": knowledge_result["source"],
                "route": "sensitive"
            }

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

    response = client.chat.completions.create(
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

    return {
        "response": response.choices[0].message.content,
        "source": "LLM",
        "route": "llm"
    }