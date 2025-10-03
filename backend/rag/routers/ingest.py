import os, glob, json, numpy as np
from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional
from sentence_transformers import SentenceTransformer
from app.core.textsplit import simple_chunk
from app.core.settings import settings

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge")
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "storage")
INDEX_PATH = os.path.join(STORAGE_DIR, "index.npz")
META_PATH = os.path.join(STORAGE_DIR, "meta.json")

class IngestRequest(BaseModel):
    extra_dir: Optional[str] = None

@router.post("/ingest")
async def ingest(req: IngestRequest = Body(default=None)):
    if not settings.ALLOW_INGEST_ENDPOINT:
        return {"ok": False, "error": "Endpoint disabled. Set ALLOW_INGEST_ENDPOINT=true to enable."}

    paths = []
    paths += glob.glob(os.path.join(DATA_DIR, "*.md"))
    paths += glob.glob(os.path.join(DATA_DIR, "*.txt"))
    if req and req.extra_dir:
        paths += glob.glob(os.path.join(req.extra_dir, "*.md"))
        paths += glob.glob(os.path.join(req.extra_dir, "*.txt"))

    docs = []
    for p in paths:
        with open(p, "r", encoding="utf-8") as f:
            txt = f.read()
        for ch in simple_chunk(txt, chunk_size=800, overlap=100):
            docs.append({"text": ch, "source": os.path.basename(p)})

    model = SentenceTransformer(settings.EMBEDDING_MODEL)
    vecs = model.encode([d["text"] for d in docs], normalize_embeddings=False)
    os.makedirs(STORAGE_DIR, exist_ok=True)
    np.savez_compressed(INDEX_PATH, embeddings=vecs)

    meta = {str(i): {"text": d["text"], "source": d["source"]} for i, d in enumerate(docs)}
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return {"ok": True, "chunks": len(docs), "emb_model": settings.EMBEDDING_MODEL}
