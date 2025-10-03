# backend/rag/core/retrieval_basic.py
import os, json, numpy as np
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer

# path ke storage
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STORE = os.path.join(ROOT, "storage")
INDEX = os.path.join(STORE, "index.npz")
META  = os.path.join(STORE, "meta.json")

# TOP_K via env (default 6)
TOP_K = int(os.getenv("TOP_K", "6"))
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

_model_instance: Optional[SentenceTransformer] = None


def _get_model() -> SentenceTransformer:
    global _model_instance
    if _model_instance is None:
        _model_instance = SentenceTransformer(EMBED_MODEL)
    return _model_instance

def _load_index():
    if not (os.path.exists(INDEX) and os.path.exists(META)):
        raise RuntimeError("Index belum ada. Taruh index.npz & meta.json di backend/rag/storage/")
    emb = np.load(INDEX)["embeddings"]           # (N, D)
    with open(META, "r", encoding="utf-8") as f:
        meta = json.load(f)
    docs = [meta[str(i)] for i in range(len(meta))]
    return emb, docs

def _cosine(q: np.ndarray, M: np.ndarray) -> np.ndarray:
    q = q.astype(np.float32); M = M.astype(np.float32)
    q /= (np.linalg.norm(q) + 1e-8)
    M /= (np.linalg.norm(M, axis=1, keepdims=True) + 1e-8)
    return M @ q

def retrieve(query: str, top_k: int | None = None) -> List[Dict]:
    k = top_k or TOP_K
    M, docs = _load_index()
    qv = _get_model().encode(query, normalize_embeddings=False)
    scores = _cosine(qv, M)
    idx = np.argsort(-scores)[:k]
    out: List[Dict] = []
    for i in idx:
        out.append({"text": docs[i]["text"], "source": docs[i]["source"], "score": float(scores[i])})
    return out
