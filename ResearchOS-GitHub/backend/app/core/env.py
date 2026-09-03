from pathlib import Path

from dotenv import load_dotenv

# Load repo-root .env when running from backend/
ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")
load_dotenv(Path.cwd() / ".env")
