RESUME_ANALYSIS_PROMPT = """You are an expert AI Career Assistant for fresh graduates and job seekers.

Analyze the resume below and return a single valid JSON object only — no markdown, no explanation.

Resume:
\"\"\"
{resume_text}
\"\"\"

Return exactly this JSON structure:
{{
  "parsed": {{
    "name": "",
    "email": "",
    "phone": "",
    "graduation_year": "",
    "preferred_role": "",
    "education": [{{"degree":"","branch":"","institution":"","year":"","cgpa":""}}],
    "technical_skills": [],
    "soft_skills": [],
    "projects": [{{"title":"","description":"","tech":[]}}],
    "internships": [{{"role":"","company":"","duration":"","description":""}}],
    "certifications": [],
    "experience": [{{"role":"","company":"","duration":"","description":""}}],
    "strengths": []
  }},
  "ats": {{
    "score": 0,
    "missing_keywords": [],
    "improvements": [],
    "summary_suggestion": ""
  }},
  "job_matches": [{{
    "job_title": "",
    "company": "",
    "match_score": 0,
    "matching_skills": [],
    "missing_skills": [],
    "salary_range": "",
    "apply_url": "",
    "location": "",
    "remote": false,
    "reason": "",
    "career_growth": ""
  }}],
  "skill_gaps": [{{
    "skill": "",
    "importance": 0,
    "difficulty": "",
    "learning_weeks": 0,
    "resources": []
  }}],
  "roadmap": [{{
    "week": 1,
    "topic": "",
    "resources": [],
    "project": ""
  }}],
  "interview": {{
    "hr": [],
    "technical": [],
    "coding": []
  }},
  "improvements": [{{"section": "", "suggestion": ""}}],
  "recommended_certifications": [],
  "github_projects": [],
  "career_prediction": {{
    "current_match": 0,
    "after_learning": 0,
    "current_salary": "",
    "after_salary": "",
    "skill_to_learn": ""
  }}
}}

Rules:
- job_matches: top 10 jobs, match_score >= 70, sorted descending
- skill_gaps: top 8 missing skills by importance desc, importance 1-10
- roadmap: 8 weeks
- interview.hr: 5 questions, interview.technical: 8 questions, interview.coding: 5 questions
- improvements: 6 suggestions
- recommended_certifications: 5 items
- github_projects: 5 project ideas
- Return ONLY the JSON object."""

TAILOR_RESUME_PROMPT = """Act as an ATS Resume Expert.

Resume:
\"\"\"
{resume_text}
\"\"\"

Job Description:
\"\"\"
{job_description}
\"\"\"

Rewrite the resume to maximize ATS score for this job. Improve summary, skills, project descriptions, add relevant keywords and action verbs. Keep all facts accurate. Return the improved resume as plain text only."""

COVER_LETTER_PROMPT = """Write a professional cover letter for this candidate applying to this job.

Candidate Profile:
{candidate_profile}

Job Title: {job_title}
Company: {company}
Job Description:
{job_description}

Write a compelling, personalized cover letter. Keep it under 350 words. Return plain text only."""

MOCK_INTERVIEW_PROMPT = """You are a senior interviewer for the role: {role}.

Candidate Resume Summary:
{resume_summary}

Generate 10 interview questions with hints. Return JSON array only:
[{{"question":"","hint":"","type":"hr|technical|coding"}}]"""
