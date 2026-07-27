import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.ai.gemini_client import call_groq

async def main():
    print("Sending dummy prompt to Groq...")
    response = await call_groq("Say 'Groq API is working!' and nothing else.")
    print(f"Response: {response}")

asyncio.run(main())
