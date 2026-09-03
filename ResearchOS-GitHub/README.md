# ResearchOS

**Autonomous AI Research & Knowledge Engineering Platform**

> Evidence before generation. Verification before confidence. Evaluation before claims. Replay before trust.

ResearchOS is not a chatbot. It is a **research operating system** that compiles a question and a corpus into a **citation-auditable artifact**: claim ledger, evidence spans, citation graph, contradiction map, multimodal paper understanding, and scored reports.

## Why it stands out

| Layer | What you get |
|-------|----------------|
| Product | Research cockpit: plan → search → retrieve → critique → verify → report |
| Truth model | Every factual sentence is a `Claim` with verdict + page/figure/table span |
| Retrieval | Hybrid (semantic + BM25) → fusion → rerank → grounded generation |
| Agents | Supervisor state machine with specialized tools (not a free-roaming swarm) |
| Multimodal | PDF layout, OCR, tables, figures, vision-language grounding |
| Proof | Ablation dashboard: faithfulness, citation accuracy, latency, cost |
| Engineering | FastAPI · Next.js · PostgreSQL/pgvector · Redis · Docker · traces |

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind — dark research instrument UI
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic
- **Data:** PostgreSQL + pgvector, Redis job queue
- **AI:** Cloud LLM / embeddings / rerank / VLM (no heavy local model containers)
- **Deploy:** Docker Compose (lightweight; respects local resource caps)

## Quick start

```bash
# 1. Environment
cp .env.example .env
# Optional: OPENAI_API_KEY for live LLM compile (cloud). Without it, seed-grounded compile still runs.

# 2. Backend (SQLite by default if Postgres is not running)
cd backend
# from repo root:
#   set PYTHONPATH=backend
#   .venv\Scripts\python -m uvicorn app.main:app --port 8000

# 3. Frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Library → Start research.

Docker Postgres/Redis is optional. The API falls back to local SQLite automatically.

## Repository layout

```
ResearchOS/
├── frontend/          # Next.js research cockpit
├── backend/           # FastAPI + agents + RAG
├── workers/           # Document ingest / embedding jobs
├── data/              # Raw / processed / evaluation corpora
├── infrastructure/    # Docker, monitoring helpers
├── docs/              # Architecture & API notes
├── docker-compose.yml
└── .env.example
```

## Core pipeline

```
QUESTION → PLAN → SEARCH → RETRIEVE → UNDERSTAND
        → REASON → CRITIQUE → VERIFY → CITE → GENERATE → EVALUATE
```

## License

Private personal project — all rights reserved unless otherwise stated.
