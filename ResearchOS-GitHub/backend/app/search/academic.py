"""Academic discovery via Semantic Scholar (key optional)."""

from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("academic_search")

S2_URL = "https://api.semanticscholar.org/graph/v1/paper/search"


async def search_papers(query: str, limit: int = 6) -> list[dict[str, Any]]:
    headers: dict[str, str] = {"User-Agent": "ResearchOS/0.1"}
    if settings.SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY
    params = {
        "query": query[:300],
        "limit": limit,
        "fields": "title,authors,year,url,abstract,venue,externalIds",
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.get(S2_URL, params=params, headers=headers)
            res.raise_for_status()
            data = res.json()
    except Exception as exc:  # noqa: BLE001
        log.warning("academic_search.failed", error=str(exc))
        return []

    papers: list[dict[str, Any]] = []
    for item in data.get("data") or []:
        authors = ", ".join(
            a.get("name", "") for a in (item.get("authors") or [])[:6] if a.get("name")
        )
        papers.append(
            {
                "title": item.get("title") or "Untitled",
                "authors": authors or None,
                "url": item.get("url"),
                "publication_date": str(item.get("year") or ""),
                "source_type": "academic",
                "abstract": (item.get("abstract") or "")[:2000],
                "venue": item.get("venue"),
            }
        )
    return papers
