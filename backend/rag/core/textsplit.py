from typing import Iterable

def simple_chunk(text: str, chunk_size: int = 800, overlap: int = 100) -> Iterable[str]:
    # approx by characters (simple & robust)
    text = text.strip().replace("\r\n", "\n")
    if len(text) <= chunk_size:
        yield text
        return
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        yield text[start:end]
        if end == len(text):
            break
        start = max(0, end - overlap)
