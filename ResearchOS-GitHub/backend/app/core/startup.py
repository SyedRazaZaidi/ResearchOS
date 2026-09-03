"""Startup helpers — create tables (SQLite fallback if Postgres is down)."""

from app.core.database import prepare_db
from app.core.logging import get_logger

log = get_logger("startup")


async def init_db() -> None:
    await prepare_db()
    log.info("database.ready")
