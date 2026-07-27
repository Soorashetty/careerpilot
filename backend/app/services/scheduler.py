import asyncio
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.database.db import SessionLocal
from app.services.job_fetcher import fetch_adzuna_jobs, fetch_remotive_jobs, fetch_arbeitnow_jobs, upsert_jobs, ADZUNA_QUERIES

scheduler = BackgroundScheduler()
logger = logging.getLogger(__name__)

def sync_jobs():
    db = SessionLocal()
    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)

        # Remotive
        try:
            remotive = loop.run_until_complete(fetch_remotive_jobs("software developer"))
            upsert_jobs(db, remotive, "remotive")
        except Exception as e:
            logger.error(f"[Scheduler] Remotive failed: {e}")

        # Arbeitnow
        try:
            arbeitnow = loop.run_until_complete(fetch_arbeitnow_jobs())
            upsert_jobs(db, arbeitnow, "arbeitnow")
        except Exception as e:
            logger.error(f"[Scheduler] Arbeitnow failed: {e}")

        # Adzuna — fetch multiple role queries
        for query in ADZUNA_QUERIES:
            try:
                adzuna = loop.run_until_complete(fetch_adzuna_jobs(query))
                upsert_jobs(db, adzuna, "adzuna")
            except Exception as e:
                logger.error(f"[Scheduler] Adzuna query='{query}' failed: {e}")

        logger.info("[Scheduler] Jobs synced successfully")
    except Exception as e:
        logger.error(f"[Scheduler] Fatal error: {e}")
    finally:
        loop.close()
        db.close()

def start_scheduler():
    scheduler.add_job(sync_jobs, "interval", hours=6, id="sync_jobs", replace_existing=True)
    scheduler.start()
    sync_jobs()

def stop_scheduler():
    scheduler.shutdown(wait=False)
