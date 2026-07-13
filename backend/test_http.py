import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "granite4.1:3b",
        "prompt": "Hallo",
        "stream": False,
    },
)

print(response.status_code)
print(response.text)