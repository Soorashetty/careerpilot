import json
import re
import asyncio
from groq import Groq
from app.config import get_settings

MAX_PROMPT_CHARS = 12000

def _get_client():
    return Groq(api_key=get_settings().GROQ_API_KEY)

async def call_groq(prompt: str) -> str:
    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]
    def _call():
        response = _get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4096,
            timeout=30,
        )
        return response.choices[0].message.content
    return await asyncio.to_thread(_call)

def extract_json(text: str) -> dict | list:
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    brace = text.find("{")
    bracket = text.find("[")
    if brace == -1 and bracket == -1:
        raise ValueError("No JSON found in response")
    if brace == -1:
        start = bracket
    elif bracket == -1:
        start = brace
    else:
        start = min(brace, bracket)
    end = max(text.rfind("}"), text.rfind("]"))
    return json.loads(text[start:end + 1])
