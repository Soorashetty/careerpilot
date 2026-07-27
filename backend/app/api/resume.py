from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume
from app.schemas.schemas import ResumeOut
from app.services.auth import get_current_user
from app.services.resume_parser import extract_text
from app.ai.agents import analyze_resume, tailor_resume, generate_cover_letter, generate_mock_interview

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/upload", response_model=ResumeOut, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {".pdf", ".docx", ".txt"}
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, TXT files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    raw_text = extract_text(file_bytes, file.filename)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    try:
        result = await analyze_resume(raw_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    # Deactivate previous resumes
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_active": False})

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        parsed_data=result.get("parsed", {}),
        ats_score=result.get("ats", {}).get("score"),
        ats_report=result.get("ats", {}),
        skill_gaps={"gaps": result.get("skill_gaps", [])},
        roadmap={"weeks": result.get("roadmap", [])},
        job_matches={"matches": result.get("job_matches", [])},
        interview_questions=result.get("interview", {}),
        improvements={"items": result.get("improvements", []), "certifications": result.get("recommended_certifications", []), "github_projects": result.get("github_projects", [])},
        career_prediction=result.get("career_prediction", {}),
        is_active=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return ResumeOut.model_validate(resume)

@router.get("/active", response_model=ResumeOut)
def get_active_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active is True).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Please upload one.")
    return ResumeOut.model_validate(resume)

@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeOut.model_validate(resume)

@router.post("/{resume_id}/tailor")
async def tailor(
    resume_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    job_description = payload.get("job_description", "")
    if not job_description:
        raise HTTPException(status_code=400, detail="job_description is required")
    tailored = await tailor_resume(resume.raw_text, job_description)
    return {"tailored_resume": tailored}

@router.post("/{resume_id}/cover-letter")
async def cover_letter(
    resume_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    letter = await generate_cover_letter(
        str(resume.parsed_data),
        payload.get("job_title", ""),
        payload.get("company", ""),
        payload.get("job_description", ""),
    )
    return {"cover_letter": letter}

@router.post("/{resume_id}/mock-interview")
async def mock_interview(
    resume_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    role = payload.get("role", resume.parsed_data.get("preferred_role", "Software Engineer"))
    questions = await generate_mock_interview(str(resume.parsed_data)[:2000], role)
    return {"questions": questions}
