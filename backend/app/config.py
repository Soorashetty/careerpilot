from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    GROQ_API_KEY: str = ""
    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""
    JSEARCH_API_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = str(ENV_FILE)

@lru_cache
def get_settings():
    return Settings()
