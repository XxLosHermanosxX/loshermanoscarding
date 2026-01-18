# Main entry point for Railway deployment
from app import app

# This file exists to provide a standard entry point for Railway
# Railway will run: uvicorn main:app --host 0.0.0.0 --port $PORT
