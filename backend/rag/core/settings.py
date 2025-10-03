# app/core/settings.py
from dataclasses import dataclass
import os
from pathlib import Path
from dotenv import load_dotenv

# Cari .env di lokasi umum agar backend & server berbagi konfigurasi
ROOT = Path(__file__).resolve().parents[2]
ENV_CANDIDATES = [
    ROOT / ".env",
    ROOT / "server" / ".env",
    ROOT.parent / ".env",
]
for candidate in ENV_CANDIDATES:
    if candidate.exists():
        load_dotenv(dotenv_path=candidate, override=False)

@dataclass
class Settings:
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    TOP_K: int = int(os.getenv("TOP_K", "4"))
    ALLOW_INGEST_ENDPOINT: bool = os.getenv("ALLOW_INGEST_ENDPOINT", "false").lower() == "true"

settings = Settings()
