from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from typing import List, Literal, Optional
import httpx, os, json

# ✅ gunakan path modul yang benar (rag.core.*)
from rag.core.settings import settings
from rag.core.retrieval_basic import retrieve


# --- tambahkan di atas (setelah import) ---
ALLOW = {"meta-llama/llama-3.1-8b-instruct", "google/gemma-2-9b-it", "qwen/qwen2.5-7b-instruct"}
MAP = {
  "x-ai/grok-4-fast:free": "meta-llama/llama-3.1-8b-instruct",
  "google/gemma-3n-e2b-it:free": "google/gemma-2-9b-it",
  "openai/gpt-oss-120b:free": "meta-llama/llama-3.1-8b-instruct",
}
def resolve_model(requested: str | None):
    if requested and requested in ALLOW: return requested, {"requested": requested, "resolved": requested, "fallback": False}
    if requested and requested in MAP:  return MAP[requested], {"requested": requested, "resolved": MAP[requested], "fallback": True}
    m = settings.OPENROUTER_MODEL or "meta-llama/llama-3.1-8b-instruct"
    return m, {"requested": requested, "resolved": m, "fallback": bool(requested)}

Role = Literal["system","user","assistant"]
class ORMessage(BaseModel): role: Role; content: str
class ORRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ORMessage]
    max_tokens: Optional[int] = 500
    temperature: Optional[float] = 0.5
    stream: Optional[bool] = False

router = APIRouter()
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "system_kai.md")
SYSTEM = open(PROMPT_PATH, "r", encoding="utf-8").read().strip() if os.path.exists(PROMPT_PATH) else "Anda adalah Asisten KAI..."


def _inject_rag(req: ORRequest):
    last_user = next((m.content for m in reversed(req.messages) if m.role=="user"), "")
    hits = retrieve(last_user)
    context = "\n\n---\n".join([f"[{h['source']}]\n{h['text']}" for h in hits])
    system = SYSTEM + "\n\nKONTEN:\n" + context
    tail = [m.model_dump() for m in req.messages if m.role != "system"]
    return [{"role":"system","content": system}, *tail], hits


def _truncate(text: str, limit: int = 240) -> str:
    return text[:limit] + ("..." if len(text) > limit else "")


def _rag_only_response(requested_model: Optional[str], hits, reason: str):
    note = {
        "requested": requested_model,
        "resolved": "rag-only",
        "fallback": True,
        "reason": reason,
    }

    if hits:
        bullet_points = "\n".join(
            [f"• [{h['source']}] {_truncate(h['text'], 200)}" for h in hits[:5]]
        )
        content = (
            "Saya belum dapat menghubungi model AI saat ini. Berikut informasi yang berhasil saya temukan:"
            f"\n\n{bullet_points}\n\nCoba lagi nanti atau hubungi tim untuk mengaktifkan model AI."
        )
    else:
        content = (
            "Saya belum dapat menghubungi model AI saat ini dan tidak menemukan informasi relevan di basis data. "
            "Silakan coba pertanyaan lain atau hubungi tim untuk mengaktifkan model AI."
        )

    data = {
        "model": note["resolved"],
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "model_resolution": note,
        "kai_sources": [
            {
                "source": h["source"],
                "snippet": _truncate(h["text"], 240),
            }
            for h in hits
        ],
    }

    return Response(
        content=json.dumps(data, ensure_ascii=False),
        media_type="application/json",
        status_code=status.HTTP_200_OK,
    )

@router.post("/v1/chat/completions")
async def openrouter_compatible(req: ORRequest):
    messages, hits = _inject_rag(req)
    model, note = resolve_model(req.model)

    payload = {"model": model, "messages": messages,
               "max_tokens": req.max_tokens, "temperature": req.temperature, "stream": False}

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # tambahkan kedua header ini untuk kompatibilitas free tier
        "HTTP-Referer": os.getenv("OPENROUTER_REFERER", "http://localhost:3000"),
        "X-Title": "KAI Helper (RAG proxy)",
    }

    if not settings.OPENROUTER_API_KEY:
        return _rag_only_response(req.model, hits, "OPENROUTER_API_KEY belum diset")

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        if response.status_code in (400, 404):  # hard fallback jika tetap error
            fb = settings.OPENROUTER_MODEL or "meta-llama/llama-3.1-8b-instruct"
            if model != fb:
                payload["model"] = fb
                note["resolved"] = fb
                note["fallback"] = True
                response = await client.post(OPENROUTER_URL, headers=headers, json=payload)

        status_code = response.status_code
        text = response.text

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raw = text.strip()
        message = (raw[:400] + ("..." if len(raw) > 400 else "")) if raw else "OpenRouter mengembalikan response tidak valid"
        return _rag_only_response(req.model, hits, message)

    data["model_resolution"] = note

    if status_code >= 400:
        reason = data.get("error", data)
        if isinstance(reason, dict):
            detail = reason.get("message") or reason.get("error") or json.dumps(reason, ensure_ascii=False)
        else:
            detail = str(reason)
        return _rag_only_response(req.model, hits, detail or f"HTTP {status_code}")

    data["kai_sources"] = [
        {
            "source": h["source"],
            "snippet": h["text"][:240] + ("..." if len(h["text"]) > 240 else ""),
        }
        for h in hits
    ]

    return Response(
        content=json.dumps(data, ensure_ascii=False),
        media_type="application/json",
        status_code=status_code,
    )


@router.get("/v1/chat/config")
async def openrouter_config():
    requested = settings.OPENROUTER_MODEL or None
    resolved, note = resolve_model(requested)
    return {
        "default_model": requested,
        "resolved_model": resolved,
        "model_resolution": note,
        "allow": sorted(ALLOW),
        "map": MAP,
    }
