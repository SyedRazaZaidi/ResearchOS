from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import run_research_pipeline
from app.ai.llm import complete_json
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.domain import (
    Claim,
    Evaluation,
    Message,
    Report,
    ResearchSession,
    Source,
    User,
)
from app.schemas.api import (
    ClaimOut,
    EvaluationOut,
    MessageCreate,
    MessageOut,
    ReportOut,
    ResearchCreate,
    ResearchOut,
    ResearchRunStatus,
    SourceOut,
    PipelineStep,
    WorkspaceOut,
)

router = APIRouter()


@router.post("", response_model=ResearchOut, status_code=status.HTTP_201_CREATED)
async def create_research(
    body: ResearchCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResearchSession:
    title = body.title or body.question.strip()[:80]
    session = ResearchSession(
        user_id=user.id,
        title=title,
        research_question=body.question.strip(),
        depth=body.depth,
        status="draft",
    )
    db.add(session)
    await db.flush()
    db.add(
        Message(
            session_id=session.id,
            role="user",
            content=body.question.strip(),
            meta={"depth": body.depth, "sources": body.sources},
        )
    )
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/compile", response_model=WorkspaceOut)
async def compile_research(
    body: ResearchCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    session = await create_research(body, user, db)
    session = await run_research_pipeline(db, session)
    return await _workspace_payload(db, session)


@router.get("", response_model=list[ResearchOut])
async def list_research(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ResearchSession]:
    result = await db.execute(
        select(ResearchSession)
        .where(ResearchSession.user_id == user.id)
        .order_by(ResearchSession.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{research_id}", response_model=ResearchOut)
async def get_research(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResearchSession:
    session = await _owned_session(db, user.id, research_id)
    return session


@router.post("/{research_id}/run", response_model=ResearchOut)
async def run_research(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResearchSession:
    session = await _owned_session(db, user.id, research_id)
    if session.status == "completed":
        return session
    return await run_research_pipeline(db, session)


@router.get("/{research_id}/status", response_model=ResearchRunStatus)
async def research_status(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResearchRunStatus:
    session = await _owned_session(db, user.id, research_id)
    order = [
        "planning",
        "searching",
        "retrieving",
        "analyzing",
        "verifying",
        "reporting",
        "completed",
    ]
    current = session.status
    steps: list[PipelineStep] = []
    reached = False
    for name in order:
        if name == "completed":
            continue
        if current == "completed" or (
            not reached and name != current and _rank(name) < _rank(current)
        ):
            steps.append(PipelineStep(name=name, status="done"))
        elif name == current or (current == "reporting" and name == "reporting"):
            steps.append(PipelineStep(name=name, status="running" if current != "completed" else "done"))
            reached = True
        elif current == "completed":
            steps.append(PipelineStep(name=name, status="done"))
        else:
            if _rank(current) > _rank(name):
                steps.append(PipelineStep(name=name, status="done"))
            elif current == name:
                steps.append(PipelineStep(name=name, status="running"))
                reached = True
            else:
                steps.append(PipelineStep(name=name, status="pending"))
    # Normalize completed
    if current == "completed":
        steps = [PipelineStep(name=s.name, status="done") for s in steps]
    return ResearchRunStatus(
        research_id=session.id,
        status=session.status,
        steps=steps,
        cost_usd=session.cost_usd or 0.0,
        confidence=session.confidence,
    )


@router.get("/{research_id}/claims", response_model=list[ClaimOut])
async def list_claims(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Claim]:
    await _owned_session(db, user.id, research_id)
    result = await db.execute(
        select(Claim).where(Claim.session_id == research_id).order_by(Claim.claim_code)
    )
    return list(result.scalars().all())


@router.get("/{research_id}/sources", response_model=list[SourceOut])
async def list_sources(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Source]:
    await _owned_session(db, user.id, research_id)
    result = await db.execute(select(Source).where(Source.session_id == research_id))
    return list(result.scalars().all())


@router.get("/{research_id}/report", response_model=ReportOut)
async def get_report(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Report:
    await _owned_session(db, user.id, research_id)
    result = await db.execute(
        select(Report)
        .where(Report.session_id == research_id)
        .order_by(Report.created_at.desc())
    )
    report = result.scalars().first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not ready")
    return report


@router.get("/{research_id}/messages", response_model=list[MessageOut])
async def list_messages(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Message]:
    await _owned_session(db, user.id, research_id)
    result = await db.execute(
        select(Message)
        .where(Message.session_id == research_id)
        .order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())


@router.post("/{research_id}/messages", response_model=MessageOut)
async def post_message(
    research_id: str,
    body: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    await _owned_session(db, user.id, research_id)
    text = body.content.strip()
    msg = Message(session_id=research_id, role="user", content=text)
    db.add(msg)
    claims = (
        await db.execute(select(Claim).where(Claim.session_id == research_id))
    ).scalars().all()
    digest = "\n".join(f"{c.claim_code} [{c.verdict}] {c.text}" for c in claims[:12])
    payload, cost = await complete_json(
        "You are ResearchOS. Reply as JSON {\"content\": string}. Use claim codes. Do not invent sources.",
        f"Follow-up:\n{text}\n\nKnown claims:\n{digest or '(none yet)'}",
    )
    reply_text = None
    if payload and isinstance(payload.get("content"), str):
        reply_text = payload["content"]
    if not reply_text:
        reply_text = (
            "Follow-up recorded. Recompile from Library to refresh the claim ledger. "
            f"Noted: “{text[:240]}”"
        )
    reply = Message(
        session_id=research_id,
        role="assistant",
        content=reply_text,
        meta={"kind": "followup", "cost_usd": cost},
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)
    return reply


@router.get("/{research_id}/evaluations", response_model=list[EvaluationOut])
async def list_evaluations(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Evaluation]:
    await _owned_session(db, user.id, research_id)
    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.session_id == research_id)
        .order_by(Evaluation.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{research_id}/workspace", response_model=WorkspaceOut)
async def get_workspace(
    research_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    session = await _owned_session(db, user.id, research_id)
    return await _workspace_payload(db, session)


async def _owned_session(
    db: AsyncSession, user_id: str, research_id: str
) -> ResearchSession:
    result = await db.execute(
        select(ResearchSession).where(
            ResearchSession.id == research_id,
            ResearchSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Research session not found")
    return session


def _rank(status: str) -> int:
    order = {
        "draft": 0,
        "planning": 1,
        "searching": 2,
        "retrieving": 3,
        "understanding": 3,
        "analyzing": 4,
        "verifying": 5,
        "reporting": 6,
        "evaluating": 7,
        "completed": 8,
        "failed": -1,
    }
    return order.get(status, 0)


async def _workspace_payload(db: AsyncSession, session: ResearchSession) -> dict:
    claims = list(
        (
            await db.execute(
                select(Claim).where(Claim.session_id == session.id).order_by(Claim.claim_code)
            )
        ).scalars().all()
    )
    sources = list(
        (await db.execute(select(Source).where(Source.session_id == session.id))).scalars().all()
    )
    report = (
        await db.execute(
            select(Report)
            .where(Report.session_id == session.id)
            .order_by(Report.created_at.desc())
        )
    ).scalars().first()
    messages = list(
        (
            await db.execute(
                select(Message)
                .where(Message.session_id == session.id)
                .order_by(Message.created_at.asc())
            )
        ).scalars().all()
    )
    evaluations = list(
        (
            await db.execute(
                select(Evaluation)
                .where(Evaluation.session_id == session.id)
                .order_by(Evaluation.created_at.desc())
            )
        ).scalars().all()
    )
    live = any((m.meta or {}).get("live") for m in messages)
    return {
        "session": session,
        "claims": claims,
        "sources": sources,
        "report": report,
        "messages": messages,
        "evaluations": evaluations,
        "live": live,
    }
