from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class ResearchCreate(BaseModel):
    question: str = Field(min_length=8, max_length=8000)
    title: Optional[str] = None
    depth: Literal["quick", "standard", "deep", "exhaustive"] = "deep"
    sources: list[str] = Field(
        default_factory=lambda: ["uploaded_documents", "academic_search"]
    )
    citation_required: bool = True


class ResearchOut(BaseModel):
    id: str
    title: str
    research_question: str
    depth: str
    status: str
    plan: Optional[dict[str, Any]] = None
    confidence: Optional[float] = None
    cost_usd: float
    latency_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClaimOut(BaseModel):
    id: str
    claim_code: str
    text: str
    verdict: str
    confidence: Optional[float] = None
    critic_notes: Optional[str] = None
    evidence: Optional[dict[str, Any]] = None
    page_number: Optional[int] = None
    source_id: Optional[str] = None

    model_config = {"from_attributes": True}


class SourceOut(BaseModel):
    id: str
    title: str
    authors: Optional[str] = None
    url: Optional[str] = None
    source_type: str
    publication_date: Optional[str] = None
    pinned: bool
    rejected: bool

    model_config = {"from_attributes": True}


class ReportOut(BaseModel):
    id: str
    title: str
    markdown: str
    sections: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EvaluationOut(BaseModel):
    id: str
    retrieval_recall: Optional[float] = None
    retrieval_precision: Optional[float] = None
    faithfulness: Optional[float] = None
    relevance: Optional[float] = None
    citation_accuracy: Optional[float] = None
    latency_ms: Optional[int] = None
    cost_usd: Optional[float] = None
    ablation_label: Optional[str] = None
    details: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=20000)


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    meta: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    page_count: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PipelineStep(BaseModel):
    name: str
    status: Literal["pending", "running", "done", "failed", "skipped"]
    detail: Optional[str] = None
    latency_ms: Optional[int] = None


class ResearchRunStatus(BaseModel):
    research_id: str
    status: str
    steps: list[PipelineStep]
    cost_usd: float
    confidence: Optional[float] = None


class WorkspaceOut(BaseModel):
    session: ResearchOut
    claims: list[ClaimOut]
    sources: list[SourceOut]
    report: Optional[ReportOut] = None
    messages: list[MessageOut]
    evaluations: list[EvaluationOut]
    live: bool = False
