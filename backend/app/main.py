from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database.db import engine
from app.models.models import Base
from app.api import auth, resume, jobs, applications, notifications
from app.services.scheduler import start_scheduler, stop_scheduler

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    # Start background job scheduler
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(
    title="CareerPilot AI API",
    description="AI-powered career assistant backend",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = [settings.FRONTEND_URL]
if settings.ENVIRONMENT == "development":
    allowed_origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(notifications.router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
