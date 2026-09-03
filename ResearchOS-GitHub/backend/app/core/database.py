from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import DEFAULT_SQLITE, REPO_ROOT, settings
from app.core.logging import get_logger

log = get_logger("database")


def _make_engine(url: str):
    Path(settings.STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    kwargs: dict = {"echo": False}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        kwargs["pool_pre_ping"] = True
    return create_async_engine(url, **kwargs)


engine = _make_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def bind_engine(url: str) -> None:
    global engine, AsyncSessionLocal
    engine = _make_engine(url)
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


_ready = False


async def prepare_db() -> None:
    global _ready, engine
    if _ready:
        return
    await ensure_engine()
    from app import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    _ready = True


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    await prepare_db()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def ensure_engine() -> None:
    """Prefer configured DB; fall back to local SQLite if Postgres is down."""
    global engine
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return
    except Exception as exc:  # noqa: BLE001
        if settings.is_sqlite:
            raise
        fallback = DEFAULT_SQLITE
        log.warning(
            "database.fallback_sqlite",
            error=str(exc),
            sqlite=fallback,
        )
        bind_engine(fallback)
        Path(REPO_ROOT / "storage").mkdir(parents=True, exist_ok=True)
