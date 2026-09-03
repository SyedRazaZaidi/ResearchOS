from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import env as _env  # noqa: F401 — load .env before settings
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.startup import init_db

configure_logging()
log = get_logger("main")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        await init_db()
    except Exception as exc:  # noqa: BLE001 — allow API to boot without DB for UI work
        log.warning("database.init_skipped", error=str(exc))
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Autonomous AI Research & Knowledge Engineering Platform. "
        "Evidence before generation. Verification before confidence."
    ),
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.APP_NAME}
