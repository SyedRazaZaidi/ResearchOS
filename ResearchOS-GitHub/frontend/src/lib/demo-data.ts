export type Verdict =
  | "supported"
  | "weak"
  | "contradicted"
  | "insufficient"
  | "pending";

export type Claim = {
  id: string;
  claim_code: string;
  text: string;
  verdict: Verdict;
  confidence: number;
  critic_notes: string;
  page_number: number | null;
  source_title: string;
  span: string;
  figure_or_table?: string | null;
};

export type Source = {
  id: string;
  title: string;
  authors: string;
  year: string;
  source_type: string;
  pinned?: boolean;
};

export type PipelineStep = {
  name: string;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  detail?: string;
};

export type ResearchSession = {
  id: string;
  title: string;
  question: string;
  status: string;
  depth: string;
  cost_usd: number;
  latency_s: number;
  confidence: number;
  updated_at: string;
  paper_count: number;
  faithfulness?: number;
};

export const DEMO_SESSION: ResearchSession = {
  id: "demo-session",
  title: "RAG hallucination mitigation",
  question:
    "Compare recent approaches for reducing hallucinations in Retrieval-Augmented Generation systems.",
  status: "completed",
  depth: "deep",
  cost_usd: 0.018,
  latency_s: 4.8,
  confidence: 0.86,
  updated_at: "Just now",
  paper_count: 4,
  faithfulness: 0.93,
};

export const DEMO_SOURCES: Source[] = [
  {
    id: "s1",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    authors: "Lewis et al.",
    year: "2020",
    source_type: "academic",
    pinned: true,
  },
  {
    id: "s2",
    title: "Measuring and Mitigating Hallucinations in RAG Systems",
    authors: "Synthetic Survey Corpus",
    year: "2024",
    source_type: "academic",
  },
  {
    id: "s3",
    title: "Hybrid Search and Reranking for Scientific Document QA",
    authors: "IR Lab Notes",
    year: "2023",
    source_type: "technical",
  },
  {
    id: "s4",
    title: "Citation Verification and Claim-Level Faithfulness",
    authors: "ResearchOS Evaluation Corpus",
    year: "2025",
    source_type: "evaluation",
  },
];

export const DEMO_CLAIMS: Claim[] = [
  {
    id: "c1",
    claim_code: "C1",
    text: "Hybrid retrieval (semantic + lexical) improves recall on scientific terminology versus dense-only search.",
    verdict: "supported",
    confidence: 0.91,
    critic_notes:
      "Supported by IR methodology comparisons; exact terms and identifiers favor BM25 fusion.",
    page_number: 6,
    source_title: "Hybrid Search and Reranking…",
    span: "Fusion of dense retrieval with BM25 recovers technical identifiers that embeddings alone miss.",
  },
  {
    id: "c2",
    claim_code: "C2",
    text: "Reranking reduces irrelevant context passed to the generator and raises answer faithfulness.",
    verdict: "supported",
    confidence: 0.88,
    critic_notes:
      "Cross-encoder rerank narrows top-k; ablation shows faithfulness lift with modest latency cost.",
    page_number: 9,
    source_title: "Measuring and Mitigating…",
    span: "Reranked contexts improved faithfulness by removing loosely related passages.",
  },
  {
    id: "c3",
    claim_code: "C3",
    text: "Claim-level citation verification catches unsupported sentences that passage retrieval alone misses.",
    verdict: "supported",
    confidence: 0.93,
    critic_notes:
      "Critic + span linking rejects claims without grounded evidence; abstention preferred over invention.",
    page_number: 12,
    source_title: "Citation Verification…",
    span: "Sentence-level entailment checks reduced unsupported claims versus document-level citation.",
  },
  {
    id: "c4",
    claim_code: "C4",
    text: "Multi-agent pipelines always reduce hallucination regardless of retrieval quality.",
    verdict: "contradicted",
    confidence: 0.22,
    critic_notes:
      "Contradicted: agents without grounding can amplify errors; verification + abstention are required.",
    page_number: 14,
    source_title: "Measuring and Mitigating…",
    span: "Unverified agent loops increased speculative statements when retrieval was weak.",
  },
  {
    id: "c5",
    claim_code: "C5",
    text: "Vision-language reading of figures is perfectly reliable for chart numeric extraction.",
    verdict: "weak",
    confidence: 0.41,
    critic_notes:
      "Weak: VLMs help but OCR/layout errors persist; bind figure claims to caption + table when present.",
    page_number: 7,
    source_title: "Hybrid Search…",
    span: "Figure 3 accuracy bars; numeric OCR disagreed with table values in 2 of 5 samples.",
    figure_or_table: "Figure 3",
  },
  {
    id: "c6",
    claim_code: "C6",
    text: "Insufficient public evidence was found for vendor-specific proprietary RAG internals.",
    verdict: "insufficient",
    confidence: 0.15,
    critic_notes:
      "Abstain: no retrievable primary sources in the indexed corpus for this proprietary claim.",
    page_number: null,
    source_title: "—",
    span: "No supporting span retrieved.",
  },
];

export const DEMO_PIPELINE: PipelineStep[] = [
  { name: "planning", label: "Planning", status: "done", detail: "6 branches" },
  { name: "searching", label: "Searching", status: "done", detail: "4 sources" },
  { name: "retrieving", label: "Retrieval", status: "done", detail: "40→8" },
  { name: "analyzing", label: "Analysis", status: "done", detail: "6 claims" },
  { name: "verifying", label: "Verification", status: "done", detail: "critic OK" },
  { name: "reporting", label: "Report", status: "done", detail: "compiled" },
];

export const DEMO_REPORT = `# Executive Summary

The analyzed literature indicates that hallucination mitigation in RAG generally relies on improved retrieval, better grounding, verification mechanisms, or post-generation correction. **Claim-level verification** is the strongest differentiator for auditability.

# Research Question

Compare recent approaches for reducing hallucinations in Retrieval-Augmented Generation systems.

# Key Findings

1. Hybrid retrieval improves scientific-term recall. [C1]
2. Reranking raises faithfulness by cutting noisy context. [C2]
3. Claim-level citation verification catches unsupported sentences. [C3]
4. Agents without verification can amplify errors. [C4]
5. Multimodal figure reading remains weak without caption binding. [C5]

# Comparative Analysis

| Approach | Faithfulness | Latency | Cost |
|----------|--------------|---------|------|
| Vector-only | Medium | Low | Low |
| Hybrid + Rerank | High | Medium | Medium |
| + Claim Verify | Very High | Higher | Medium |

# Limitations

OCR/vision errors, API coverage gaps, and open-ended answer scoring remain hard.

# Research Gaps (potential)

Standardized claim-ledger benchmarks; cost-aware routing that preserves citation accuracy.

# References

[1] Lewis et al., 2020  
[2] ResearchOS Evaluation Corpus  
[3] Hybrid Search and Reranking notes
`;

export const ABLATIONS = [
  { label: "A · Vector", faithfulness: 82, recall: 71, citation: 74, latency: 2.1, cost: 0.008 },
  { label: "B · Hybrid", faithfulness: 87, recall: 84, citation: 81, latency: 2.5, cost: 0.011 },
  { label: "C · + Rerank", faithfulness: 91, recall: 90, citation: 88, latency: 3.4, cost: 0.015 },
  { label: "D · + Verify", faithfulness: 94, recall: 92, citation: 95, latency: 4.7, cost: 0.018 },
  { label: "E · Full OS", faithfulness: 95, recall: 93, citation: 96, latency: 6.2, cost: 0.024 },
];
