from typing import List, Tuple
import numpy as np


class InMemoryVectorStore:
    def __init__(self):
        self._ids: list[str] = []
        self._vecs: list[np.ndarray] = []

    def upsert(self, id: str, vectors: List[List[float]]):
        # For simplicity, store the mean vector for an id
        arr = np.array(vectors)
        mean = arr.mean(axis=0)
        self._ids.append(id)
        self._vecs.append(mean)

    def search(self, vectors: List[List[float]], top_k: int = 5) -> List[Tuple[str, float]]:
        if len(self._vecs) == 0:
            return []
        query = np.array(vectors).mean(axis=0)
        vecs = np.stack(self._vecs)
        # cosine similarity
        dot = vecs @ query
        vec_norms = np.linalg.norm(vecs, axis=1)
        q_norm = np.linalg.norm(query)
        sims = dot / (vec_norms * (q_norm + 1e-12))
        idx = np.argsort(-sims)[:top_k]
        return [(self._ids[i], float(sims[i])) for i in idx]
