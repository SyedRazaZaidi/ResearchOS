"""Hybrid retrieval primitives (semantic + lexical fusion + rerank hooks)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class RetrievalHit:
    chunk_id: str
    document_id: str
    content: str
    score: float
    page_number: int | None = None
    section: str | None = None
    source: str = "hybrid"


def fuse_rrf(
    semantic: list[RetrievalHit],
    lexical: list[RetrievalHit],
    k: int = 60,
) -> list[RetrievalHit]:
    """Reciprocal Rank Fusion of two ranked lists."""
    scores: dict[str, float] = {}
    payloads: dict[str, RetrievalHit] = {}

    for rank, hit in enumerate(semantic, start=1):
        scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + 1.0 / (k + rank)
        payloads[hit.chunk_id] = hit
    for rank, hit in enumerate(lexical, start=1):
        scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + 1.0 / (k + rank)
        payloads[hit.chunk_id] = hit

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    out: list[RetrievalHit] = []
    for chunk_id, score in ranked:
        hit = payloads[chunk_id]
        out.append(
            RetrievalHit(
                chunk_id=hit.chunk_id,
                document_id=hit.document_id,
                content=hit.content,
                score=score,
                page_number=hit.page_number,
                section=hit.section,
                source="fused",
            )
        )
    return out


def select_top(hits: list[RetrievalHit], n: int = 8) -> list[RetrievalHit]:
    return hits[:n]


def retrieval_trace(hits: list[RetrievalHit]) -> dict[str, Any]:
    return {
        "count": len(hits),
        "top_scores": [round(h.score, 4) for h in hits[:5]],
        "pages": [h.page_number for h in hits[:5]],
    }
