from app.database import db
from app.ai.embeddings import generate_embedding


def vector_search(query_text: str, limit=5):
    embedding = generate_embedding(query_text)


    pipeline = [
    {
    "$vectorSearch": {
    "index": "skill_vector_index",
    "path": "embedding",
    "queryVector": embedding,
    "numCandidates": 100,
    "limit": limit
    }
    }
    ]
    return list(db.skills.aggregate(pipeline))