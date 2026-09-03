from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_SQLITE = f"sqlite+aiosqlite:///{(REPO_ROOT / 'storage' / 'researchos.db').as_posix()}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "ResearchOS"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "dev-secret-change-me"
    API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"

    DATABASE_URL: str = DEFAULT_SQLITE
    DATABASE_URL_SYNC: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    STORAGE_PATH: str = str(REPO_ROOT / "storage")
    MAX_UPLOAD_MB: int = 50

    JWT_SECRET: str = "dev-jwt-secret-change-me-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    RERANK_MODEL: str = "rerank-english-v3.0"
    VISION_MODEL: str = "gpt-4o"

    SEMANTIC_SCHOLAR_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""

    DEFAULT_SPEND_CAP_USD: float = 5.0
    MAX_AGENT_STEPS: int = 40

    LOG_LEVEL: str = "INFO"
    ENABLE_TRACING: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
