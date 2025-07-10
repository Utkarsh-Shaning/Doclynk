from pymongo import MongoClient

# ✅ Use local MongoDB
client = MongoClient("mongodb://localhost:27017")

db = client["doclynk"]
collection = db["patients"]
