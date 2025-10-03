# app/core/retrieval_hybrid.py
# Hybrid retrieval: BGE-M3 (dense, jika tersedia) + BM25 (lexical) + fallback ke MiniLM index lama
import os, json, numpy as np, logging
from functools import lru_cache
from typing import List, Dict
from rank_bm25 import BM25Okapi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STORAGE_DIR = os.path.join(ROOT, "storage")
META_PATH = os.path.join(STORAGE_DIR, "meta.json")
MINILM_INDEX_PATH = os.path.join(STORAGE_DIR, "index.npz")        # dari pipeline lama
BGE_CACHE = os.path.join(STORAGE_DIR, "bge_m3_index.npz")         # cache dense BGE-M3

ALPHA = float(os.getenv("HYBRID_ALPHA", "0.65"))
TOP_K_DEFAULT = int(os.getenv("TOP_K", "8"))

log = logging.getLogger("hybrid")
log.setLevel(logging.INFO)

# -------- util --------
def _cosine_sim(q: np.ndarray, M: np.ndarray) -> np.ndarray:
    q = q.astype(np.float32)
    M = M.astype(np.float32)
    q /= (np.linalg.norm(q) + 1e-8)
    M /= (np.linalg.norm(M, axis=1, keepdims=True) + 1e-8)
    return M @ q

def _minmax(x: np.ndarray) -> np.ndarray:
    if x.size == 0:
        return x
    mn, mx = float(x.min()), float(x.max())
    if mx - mn < 1e-12:
        return np.zeros_like(x)
    return (x - mn) / (mx - mn)

# -------- corpus/meta --------
@lru_cache(maxsize=1)
def _load_meta() -> Dict[str, Dict]:
    if not os.path.exists(META_PATH):
        raise RuntimeError("meta.json tidak ditemukan. Jalankan `python scripts/ingest.py` dulu.")
    with open(META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@lru_cache(maxsize=1)
def _load_corpus() -> List[str]:
    meta = _load_meta()
    items = [meta[str(i)] for i in range(len(meta))]
    return [it["text"] for it in items]

@lru_cache(maxsize=1)
def _load_sources() -> List[str]:
    meta = _load_meta()
    items = [meta[str(i)] for i in range(len(meta))]
    return [it["source"] for it in items]

# -------- BM25 --------
@lru_cache(maxsize=1)
def _load_bm25():
    corpus = _load_corpus()
    toks = [c.lower().split() for c in corpus]
    return BM25Okapi(toks), toks

# -------- Dense: prefer BGE-M3, fallback ke MiniLM index lama --------
@lru_cache(maxsize=1)
def _has_minilm_index() -> bool:
    return os.path.exists(MINILM_INDEX_PATH)

@lru_cache(maxsize=1)
def _load_minilm_matrix():
    if not _has_minilm_index():
        return None
    arr = np.load(MINILM_INDEX_PATH)
    return arr["embeddings"]  # (N, D)

# Try import FlagEmbedding lazily
def _try_import_bge():
    try:
        from FlagEmbedding import BGEM3FlagModel  # type: ignore
        return BGEM3FlagModel
    except Exception as e:
        log.warning("BGEM3 not available (%s). Will use fallback dense.", e)
        return None

@lru_cache(maxsize=1)
def _load_bge_model():
    BGEM3 = _try_import_bge()
    if BGEM3 is None:
        return None
    try:
        # CPU-ok; set devices=["cuda:0"] bila ada GPU
        return BGEM3("BAAI/bge-m3", use_fp16=False, devices=["cpu"])
    except Exception as e:
        log.warning("Failed to init BGE-M3 model: %s", e)
        return None

@lru_cache(maxsize=1)
def _load_or_build_bge_matrix():
    model = _load_bge_model()
    if model is None:
        return None
    if os.path.exists(BGE_CACHE):
        arr = np.load(BGE_CACHE)
        return arr["emb"]
    # build sekali
    corpus = _load_corpus()
    enc = model.encode(
        corpus, batch_size=24, max_length=8192,
        use_fp16=False, return_dense=True
    )
    emb = np.asarray(enc["dense_vecs"], dtype=np.float32)
    os.makedirs(STORAGE_DIR, exist_ok=True)
    np.savez_compressed(BGE_CACHE, emb=emb)
    return emb

def _dense_scores(query: str) -> np.ndarray:
    """
    Kembalikan skor dense untuk seluruh korpus:
    1) Coba BGE-M3
    2) Jika gagal/absen, pakai MiniLM index lama (index.npz) + SentenceTransformer untuk query
    3) Jika keduanya tak ada, return zeros
    """
    # 1) BGE-M3
    model = _load_bge_model()
    if model is not None:
        try:
            q = model.encode([query], return_dense=True, use_fp16=False)["dense_vecs"][0]
            q = np.asarray(q, dtype=np.float32)
            M = _load_or_build_bge_matrix()
            if M is not None:
                return _cosine_sim(q, M)
        except Exception as e:
            log.warning("BGE-M3 scoring failed: %s", e)

    # 2) Fallback MiniLM
    M2 = _load_minilm_matrix()
    if M2 is not None:
        # import di sini supaya ringan saat BGE jalan
        from sentence_transformers import SentenceTransformer  # type: ignore
        import os as _os
        model_name = _os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        st = SentenceTransformer(model_name)
        q2 = st.encode(query, normalize_embeddings=False)
        q2 = np.asarray(q2, dtype=np.float32)
        return _cosine_sim(q2, M2)

    # 3) No dense available
    return np.zeros(len(_load_corpus()), dtype=np.float32)

# -------- Public API --------
def retrieve_hybrid(query: str, top_k: int | None = None) -> List[Dict]:
    k = top_k or TOP_K_DEFAULT
    corpus = _load_corpus()
    sources = _load_sources()

    # dense & bm25
    ds = _dense_scores(query)                             # shape (N,)
    bm25, _ = _load_bm25()
    bs = np.array(bm25.get_scores(query.lower().split()), dtype=np.float32)

    # normalisasi + gabung
    ds_n = _minmax(ds)
    bs_n = _minmax(bs)
    hybrid = ALPHA * ds_n + (1.0 - ALPHA) * bs_n

    idx = np.argsort(-hybrid)[:k]
    out = []
    for i in idx:
        out.append({
            "id": int(i),
            "score_dense": float(ds[i]),
            "score_bm25": float(bs[i]),
            "score": float(hybrid[i]),
            "text": corpus[i],
            "source": sources[i],
        })
    return out
