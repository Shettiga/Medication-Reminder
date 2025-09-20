# backend/db.py
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client.medication_reminder

users_collection = db.users
reminders_collection = db.reminders
