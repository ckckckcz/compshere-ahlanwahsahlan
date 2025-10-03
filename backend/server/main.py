# backend/server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="KAI Assistant Backend (Face + RAG)")

# CORS
origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from rag.routers.openrouter_proxy import router as or_router
app.include_router(or_router, prefix="")  # -> POST /v1/chat/completions

# (opsional) jika ada /rag/chat
try:
    from rag.routers.chat import router as rag_chat
    app.include_router(rag_chat, prefix="/rag")
except Exception:
    pass

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/")
def root():
    return {
        "app": "KAI Assistant Backend",
        "endpoints": {
            "openrouter_proxy": "POST /v1/chat/completions",
            "rag_chat": "POST /rag/chat (jika diaktifkan)",
            "docs": "/docs",
            "health": "/healthz",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.main:app",            # <- modul.path yang benar
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )