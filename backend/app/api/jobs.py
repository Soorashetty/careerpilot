from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.db import get_db
from app.models.models import Job, User, Resume
from app.schemas.schemas import JobOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/recommended", response_model=list[JobOut])
def recommended_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active is True).first()
    if resume is None:
        return []
    skills = resume.parsed_data.get("technical_skills", [])
    preferred_role = resume.parsed_data.get("preferred_role", "")
    all_jobs = db.query(Job).order_by(Job.created_at.desc()).limit(500).all()
    if not skills and not preferred_role:
        return all_jobs[:20]
    results = []
    for job in all_jobs:
        job_skills = [s.lower() for s in (job.required_skills or [])]
        job_title_lower = (job.title or "").lower()
        job_desc_lower = (job.description or "")[:500].lower()
        score = 0
        for s in skills:
            sl = s.lower()
            if sl in job_skills or sl in job_title_lower or sl in job_desc_lower:
                score += 1
        if preferred_role and preferred_role.lower() in job_title_lower:
            score += 3
        if score > 0:
            results.append((score, job))
    results.sort(key=lambda x: x[0], reverse=True)
    top = [j for _, j in results[:20]]
    # If not enough matches, pad with latest jobs
    if len(top) < 10:
        seen_ids = {j.id for j in top}
        for job in all_jobs:
            if job.id not in seen_ids:
                top.append(job)
            if len(top) >= 20:
                break
    return top

@router.get("/search", response_model=list[JobOut])
def search_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    remote: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Job)
    if q:
        query = query.filter(Job.title.ilike(f"%{q}%") | Job.description.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if remote is not None:
        query = query.filter(Job.remote == remote)
    offset = (page - 1) * limit
    return query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")
    return job
