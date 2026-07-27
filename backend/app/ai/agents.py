from app.ai.gemini_client import call_groq as call_ai, extract_json
from app.ai.prompts.templates import (
    RESUME_ANALYSIS_PROMPT, TAILOR_RESUME_PROMPT,
    COVER_LETTER_PROMPT, MOCK_INTERVIEW_PROMPT
)

async def analyze_resume(resume_text: str) -> dict:
    prompt = RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text[:8000])
    raw = await call_ai(prompt)
    return extract_json(raw)

async def tailor_resume(resume_text: str, job_description: str) -> str:
    prompt = TAILOR_RESUME_PROMPT.format(resume_text=resume_text[:4000], job_description=job_description[:2000])
    result = await call_ai(prompt)
    # Strip markdown code fences if AI wraps output
    import re
    result = re.sub(r"^```[\w]*\n?", "", result.strip())
    result = re.sub(r"\n?```$", "", result.strip())
    return result.strip()

async def generate_cover_letter(candidate_profile: str, job_title: str, company: str, job_description: str) -> str:
    prompt = COVER_LETTER_PROMPT.format(
        candidate_profile=candidate_profile[:2000],
        job_title=job_title, company=company,
        job_description=job_description[:1500]
    )
    result = await call_ai(prompt)
    import re
    result = re.sub(r"^```[\w]*\n?", "", result.strip())
    result = re.sub(r"\n?```$", "", result.strip())
    return result.strip()

async def generate_mock_interview(resume_summary: str, role: str) -> list:
    prompt = MOCK_INTERVIEW_PROMPT.format(resume_summary=resume_summary[:2000], role=role)
    raw = await call_ai(prompt)
    return extract_json(raw)
