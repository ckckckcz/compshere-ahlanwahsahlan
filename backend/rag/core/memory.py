# app/core/memory.py
import os
from collections import deque
from typing import List, Dict

MAX_MSG = int(os.getenv("MEMORY_MAX_MESSAGES", "12"))  # jumlah pesan disimpan per sesi

class MemoryStore:
    def __init__(self, max_messages: int = MAX_MSG):
        self.store: Dict[str, deque] = {}
        self.max_messages = max_messages

    def append(self, session_id: str, role: str, content: str):
        if not session_id:
            return
        q = self.store.setdefault(session_id, deque(maxlen=self.max_messages))
        q.append({"role": role, "content": content})

    def get(self, session_id: str) -> List[Dict]:
        if not session_id:
            return []
        return list(self.store.get(session_id, []))

    def clear(self, session_id: str):
        if session_id in self.store:
            del self.store[session_id]

memory = MemoryStore()