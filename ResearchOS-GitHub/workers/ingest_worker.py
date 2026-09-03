"""Background ingest worker entry (Redis/queue wiring comes next)."""

from __future__ import annotations

import argparse
from pathlib import Path

from app.documents.pipeline import parse_pdf_basic, parse_txt


def process_file(path: Path) -> int:
    if path.suffix.lower() == ".pdf":
        chunks = parse_pdf_basic(path)
    else:
        chunks = parse_txt(path)
    print(f"Processed {path.name}: {len(chunks)} chunks")
    return len(chunks)


def main() -> None:
    parser = argparse.ArgumentParser(description="ResearchOS ingest worker")
    parser.add_argument("path", type=Path, help="File to process")
    args = parser.parse_args()
    process_file(args.path)


if __name__ == "__main__":
    main()
