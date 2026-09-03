"""Document ingest helpers — parse → structure-aware chunk → index."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class ParsedChunk:
    content: str
    page_number: int | None
    section: str | None
    chunk_type: str


def chunk_plain_text(text: str, max_chars: int = 1200) -> list[ParsedChunk]:
    parts: list[ParsedChunk] = []
    buf: list[str] = []
    size = 0
    for para in text.split("\n\n"):
        p = para.strip()
        if not p:
            continue
        if size + len(p) > max_chars and buf:
            parts.append(
                ParsedChunk(
                    content="\n\n".join(buf),
                    page_number=None,
                    section=None,
                    chunk_type="text",
                )
            )
            buf, size = [], 0
        buf.append(p)
        size += len(p)
    if buf:
        parts.append(
            ParsedChunk(
                content="\n\n".join(buf),
                page_number=None,
                section=None,
                chunk_type="text",
            )
        )
    return parts


def parse_txt(path: Path) -> list[ParsedChunk]:
    return chunk_plain_text(path.read_text(encoding="utf-8", errors="replace"))


def parse_docx(path: Path) -> list[ParsedChunk]:
    try:
        from docx import Document as DocxDocument
    except ImportError:
        return parse_txt(path) if path.suffix.lower() == ".txt" else []

    document = DocxDocument(str(path))
    text = "\n\n".join(p.text.strip() for p in document.paragraphs if p.text.strip())
    return chunk_plain_text(text)


def parse_pdf_basic(path: Path) -> list[ParsedChunk]:
    try:
        from pypdf import PdfReader
    except ImportError:
        return [
            ParsedChunk(
                content=f"[PDF placeholder] {path.name}",
                page_number=1,
                section=None,
                chunk_type="text",
            )
        ]

    reader = PdfReader(str(path))
    chunks: list[ParsedChunk] = []
    for i, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if not text:
            continue
        for c in chunk_plain_text(text):
            chunks.append(
                ParsedChunk(
                    content=c.content,
                    page_number=i,
                    section=c.section,
                    chunk_type="text",
                )
            )
    return chunks
