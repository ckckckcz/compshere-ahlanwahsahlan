from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.llm import openrouter_chat
from app.core.memory import memory                # ⬅️ NEW
from app.core.retrieval import retrieve_hybrid as retrieve  # atau retrieval biasa
import os

router = APIRouter()

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "system_kai.md")
with open(PROMPT_PATH, "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read().strip()

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None      # bisa pakai ini sebagai session_id
    tone: Optional[str] = "conversational-pro"

TONE_HINTS = {
    "conversational-pro": "Tulis seperti CS profesional: hangat, langsung, mudah dipahami. Rujuk singkat ke penjelasan sebelumnya bila relevan.",
    "bullet-compact": "Gunakan bullet singkat (maks 5 poin) tanpa heading, tetap natural.",
    "formal": "Gaya formal dan lugas.",
}

@router.post("/chat")
async def chat(req: ChatRequest):
    session_id = req.user_id or "default"   # ⬅️ ambil session id dari user_id; UI akan mengirimkannya
    # 1) Ambil memori percakapan pendek
    history = memory.get(session_id)

    # 2) Retrieval untuk pertanyaan TERKINI
    hits = retrieve(req.message)
    context = "\n\n---\n".join([f"[{h['source']}]\n{h['text']}" for h in hits])

    tone_hint = TONE_HINTS.get(req.tone or "conversational-pro", TONE_HINTS["conversational-pro"])

    # 3) Susun pesan ke LLM: system → sejarah singkat → user sekarang
    messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + tone_hint + "\n\nKONTEN:\n" + context}]
    # sisipkan riwayat (maks ~12 pesan sesuai memory)
    messages.extend(history)
    messages.append({"role": "user", "content": req.message})

    answer = await openrouter_chat(messages, temperature=0.5)

    # 4) Simpan ke memori (user→assistant)
    memory.append(session_id, "user", req.message)
    memory.append(session_id, "assistant", answer)

    sources = [{"source": h["source"], "snippet": h["text"][:240] + ("..." if len(h["text"])>240 else "")} for h in hits]
    return {"answer": answer.strip(), "sources": sources, "meta": {"top_k": len(hits), "session_id": session_id}}

@router.post("/chat/reset")
async def reset_chat(user_id: Optional[str] = None):
    sid = user_id or "default"
    memory.clear(sid)
    return {"ok": True, "session_id": sid}