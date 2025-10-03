import httpx, os
from app.core.settings import settings

BASE_URL = "https://openrouter.ai/api/v1"

async def openrouter_chat(messages: list[dict], temperature: float = 0.2) -> str:
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set")
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "kai-helper-chatbot",
        "X-Title": "kai-helper-chatbot",
    }
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60) as client:
        r = await client.post("/chat/completions", json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]
