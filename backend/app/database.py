from pymongo import MongoClient
from app.config import MONGO_URI


client = MongoClient(MONGO_URI)
db = client.ExchangeDB
db.users.create_index("email", unique=True)