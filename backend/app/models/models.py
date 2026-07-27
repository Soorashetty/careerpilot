import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.db import Base
import enum

class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    interview = "interview"
    offered = "offered"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(300), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resumes: Mapped[list["Resume"]] = relationship(back_populates="user", cascade="all, delete")
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete")

class Resume(Base):
    __tablename__ = "resumes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(300))
    raw_text: Mapped[str] = mapped_column(Text)
    parsed_data: Mapped[dict] = mapped_column(JSON, default={})
    ats_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ats_report: Mapped[dict] = mapped_column(JSON, default={})
    skill_gaps: Mapped[dict] = mapped_column(JSON, default={})
    roadmap: Mapped[dict] = mapped_column(JSON, default={})
    job_matches: Mapped[dict] = mapped_column(JSON, default={})
    interview_questions: Mapped[dict] = mapped_column(JSON, default={})
    improvements: Mapped[dict] = mapped_column(JSON, default={})
    career_prediction: Mapped[dict] = mapped_column(JSON, default={})
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    external_id: Mapped[str] = mapped_column(String(300), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(300))
    company: Mapped[str] = mapped_column(String(300))
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str] = mapped_column(Text, default="")
    required_skills: Mapped[list] = mapped_column(JSON, default=[])
    salary_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="USD")
    apply_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    posted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    job_title: Mapped[str] = mapped_column(String(300))
    company: Mapped[str] = mapped_column(String(300))
    status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus), default=ApplicationStatus.applied)
    apply_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="applications")

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    message: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
