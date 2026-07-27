from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from app.models.models import ApplicationStatus

# Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar: Optional[str] = None
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Resume
class ResumeOut(BaseModel):
    id: int
    filename: str
    ats_score: Optional[int]
    parsed_data: dict
    ats_report: dict
    skill_gaps: dict
    roadmap: dict
    job_matches: dict
    interview_questions: dict
    improvements: dict
    career_prediction: dict
    created_at: datetime
    class Config: from_attributes = True

# Jobs
class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str]
    remote: bool
    description: str
    required_skills: list
    salary_min: Optional[float]
    salary_max: Optional[float]
    apply_url: Optional[str]
    posted_at: Optional[datetime]
    class Config: from_attributes = True

# Applications
class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    status: ApplicationStatus = ApplicationStatus.applied
    apply_url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    job_title: str
    company: str
    status: ApplicationStatus
    apply_url: Optional[str]
    notes: Optional[str]
    applied_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

# Notifications
class NotificationOut(BaseModel):
    id: int
    message: str
    read: bool
    created_at: datetime
    class Config: from_attributes = True
