"""Lexical retrieval over ingested chunks (BM25-lite)."""

from __future__ import annotations

import math
import re
from collections import Counter

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.domain import Document, DocumentChunk
from app.retrieval.hybrid import RetrievalHit, select_top

_TOKEN = re.compile(r"[a-z0-9]{2,}", re.I)


def tokenize(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN.findall(text)]


def bm25_score(query_tokens: list[str], doc_tokens: list[str], avgdl: float) -> float:
    if not doc_tokens:
        return 0.0
    tf = Counter(doc_tokens)
    dl = len(doc_tokens)
    k1, b = 1.4, 0.75
    score = 0.0
    qtf = Counter(query_tokens)
    for term, qn in qtf.items():
        f = tf.get(term, 0)
        if f == 0:
            continue
        idf = math.log(1.0 + qn)
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / max(avgdl, 1.0)))
    return score


async def retrieve_for_user(
    db: AsyncSession,
    user_id: str,
    query: str,
    *,
    session_id: str | None = None,
    top_k: int = 8,
) -> list[RetrievalHit]:
    stmt = (
        select(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(Document.user_id == user_id, Document.status == "indexed")
    )
    if session_id:
        stmt = stmt.where(
            (Document.session_id == session_id) | (Document.session_id.is_(None))
        )
    rows = (await db.execute(stmt)).all()
    if not rows:
        return []

    q_tokens = tokenize(query)
    tokenized: list[list[str]] = [tokenize(chunk.content) for chunk, _doc in rows]
    avgdl = sum(len(t) for t in tokenized) / max(len(tokenized), 1)
    hits: list[RetrievalHit] = []
    for (chunk, doc), tokens in zip(rows, tokenized, strict=True):
        score = bm25_score(q_tokens, tokens, avgdl)
        if score <= 0:
            continue
        hits.append(
            RetrievalHit(
                chunk_id=chunk.id,
                document_id=doc.id,
                content=chunk.content,
                score=score,
                page_number=chunk.page_number,
                section=chunk.section or doc.filename,
                source="bm25",
            )
        )
    hits.sort(key=lambda h: h.score, reverse=True)
    return select_top(hits, top_k)
