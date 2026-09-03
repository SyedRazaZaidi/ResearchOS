# Architecture Overview

## Principle

LLM as a reasoning component — not the entire system.

Deterministic: auth, validation, storage, citation records, access control.  
AI: planning, semantic analysis, synthesis, figure interpretation, critique.

## Pipeline

```
QUESTION → PLAN → SEARCH → RETRIEVE → UNDERSTAND
        → REASON → CRITIQUE → VERIFY → CITE → GENERATE → EVALUATE
```

## Claim ledger

`Session → Documents → Chunks → EvidenceSpans → Claims → Verdicts → ReportSections`

A report sentence without a claim ID is rejected.

## Stack

- Next.js research cockpit
- FastAPI supervisor API
- PostgreSQL + pgvector
- Redis (jobs / cache)
- Cloud LLM / embed / rerank / VLM

## Security

Uploaded documents are **untrusted data**, never instructions. Tool permissions are restricted. Secrets live in environment variables only.
