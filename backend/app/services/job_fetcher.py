import httpx
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Job
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

ADZUNA_QUERIES = [
    "software engineer",
    "frontend developer",
    "backend developer",
    "data scientist",
    "full stack developer",
]

async def fetch_adzuna_jobs(query: str = "software engineer", country: str = "in", results: int = 50) -> list[dict]:
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        logger.warning("[Adzuna] Missing APP_ID or APP_KEY")
        return []
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": results,
        "what": query,
        "content-type": "application/json",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, params=params)
        if r.status_code != 200:
            logger.error(f"[Adzuna] HTTP {r.status_code}: {r.text[:200]}")
            return []
        data = r.json()
        results_list = data.get("results", [])
        logger.info(f"[Adzuna] Fetched {len(results_list)} jobs for query='{query}'")
        return results_list

async def fetch_remotive_jobs(search: str = "software") -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"https://remotive.com/api/remote-jobs?search={search}&limit=50")
        if r.status_code != 200:
            return []
        return r.json().get("jobs", [])

async def fetch_arbeitnow_jobs() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get("https://www.arbeitnow.com/api/job-board-api?page=1")
        if r.status_code != 200:
            return []
        return r.json().get("data", [])

def _parse_company(raw: dict, source: str) -> str:
    if source == "adzuna":
        company = raw.get("company", {})
        return (company.get("display_name", "") if isinstance(company, dict) else str(company))[:300]
    return str(raw.get("company_name") or raw.get("company") or "")[:300]

def _parse_location(raw: dict, source: str) -> str:
    if source == "adzuna":
        loc = raw.get("location", {})
        return (loc.get("display_name", "") if isinstance(loc, dict) else str(loc))[:300]
    return str(raw.get("candidate_required_location") or raw.get("location") or "")[:300]

def _parse_apply_url(raw: dict, source: str) -> str:
    if source == "adzuna":
        return (raw.get("redirect_url") or "")[:1000]
    return (raw.get("url") or raw.get("apply_url") or "")[:1000]

def _parse_skills(raw: dict, source: str) -> list:
    if source == "adzuna":
        category = raw.get("category", {})
        label = category.get("label", "") if isinstance(category, dict) else ""
        return [label] if label else []
    return raw.get("tags") or []

def _parse_salary(raw: dict, source: str) -> tuple[float | None, float | None]:
    if source == "adzuna":
        return raw.get("salary_min"), raw.get("salary_max")
    return None, None

def _parse_remote(raw: dict, source: str) -> bool:
    if source == "adzuna":
        title = (raw.get("title") or "").lower()
        desc = (raw.get("description") or "").lower()
        return "remote" in title or "work from home" in title or "remote" in desc[:200]
    return raw.get("job_type") == "remote" or raw.get("remote", False)

def upsert_jobs(db: Session, jobs_raw: list[dict], source: str):
    inserted = 0
    updated = 0
    for raw in jobs_raw:
        try:
            raw_id = str(raw.get("id") or raw.get("slug") or raw.get("url", ""))
            if not raw_id:
                continue
            # Prefix with source to avoid cross-source ID collisions
            external_id = f"{source}:{raw_id}"[:300]
            existing = db.query(Job).filter(Job.external_id == external_id).first()
            salary_min, salary_max = _parse_salary(raw, source)
            if existing:
                existing.title = (raw.get("title") or existing.title)[:300]
                existing.apply_url = _parse_apply_url(raw, source) or existing.apply_url
                existing.updated_at = datetime.now(timezone.utc)
                updated += 1
            else:
                job = Job(
                    external_id=external_id,
                    source=source,
                    title=(raw.get("title") or "")[:300],
                    company=_parse_company(raw, source),
                    location=_parse_location(raw, source),
                    remote=_parse_remote(raw, source),
                    description=(raw.get("description") or raw.get("job_description") or "")[:5000],
                    required_skills=_parse_skills(raw, source),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    apply_url=_parse_apply_url(raw, source),
                )
                db.add(job)
                inserted += 1
        except Exception as e:
            logger.error(f"[upsert_jobs] Failed for source={source} id={raw.get('id')}: {e}")
            continue
    db.commit()
    logger.info(f"[upsert_jobs] source={source} inserted={inserted} updated={updated}")
