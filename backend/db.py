import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)
db = client["doclynk"]
collection = db["patients"]
