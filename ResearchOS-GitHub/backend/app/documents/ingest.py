"""Ingest uploaded files into structured chunks."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.documents.pipeline import ParsedChunk, parse_docx, parse_pdf_basic, parse_txt
from app.models.domain import Document, DocumentChunk


def parse_file(path: Path, file_type: str) -> list[ParsedChunk]:
    suffix = file_type.lower().lstrip(".")
    if suffix == "pdf":
        return parse_pdf_basic(path)
    if suffix in {"txt", "md"}:
        return parse_txt(path)
    if suffix == "docx":
        return parse_docx(path)
    return []


async def ingest_document(db: AsyncSession, doc: Document) -> Document:
    path = Path(doc.storage_path)
    chunks = parse_file(path, doc.file_type)
    await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))
    pages = {c.page_number for c in chunks if c.page_number is not None}
    for c in chunks:
        db.add(
            DocumentChunk(
                document_id=doc.id,
                content=c.content,
                page_number=c.page_number,
                section=c.section,
                chunk_type=c.chunk_type,
            )
        )
    doc.page_count = len(pages) or (1 if chunks else 0)
    doc.status = "indexed" if chunks else "empty"
    meta = dict(doc.meta or {})
    meta["chunk_count"] = len(chunks)
    doc.meta = meta
    await db.flush()
    return doc
