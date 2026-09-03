const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("researchos_token");
}

export function setToken(token: string) {
  localStorage.setItem("researchos_token", token);
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function ensureSession(): Promise<string> {
  const existing = getToken();
  if (existing) return existing;
  const data = await api<{ access_token: string }>("/api/auth/bootstrap", {
    method: "POST",
  });
  setToken(data.access_token);
  return data.access_token;
}

export type ApiClaim = {
  id: string;
  claim_code: string;
  text: string;
  verdict: string;
  confidence: number | null;
  critic_notes: string | null;
  evidence: {
    span?: string;
    source_title?: string | null;
    figure_or_table?: string | null;
  } | null;
  page_number: number | null;
  source_id: string | null;
};

export type ApiSource = {
  id: string;
  title: string;
  authors: string | null;
  url: string | null;
  source_type: string;
  publication_date: string | null;
  pinned: boolean;
  rejected: boolean;
};

export type ApiWorkspace = {
  session: {
    id: string;
    title: string;
    research_question: string;
    depth: string;
    status: string;
    plan: { branches?: { id: string; label: string; enabled: boolean }[] } | null;
    confidence: number | null;
    cost_usd: number;
    latency_ms: number | null;
    created_at: string;
    updated_at: string;
  };
  claims: ApiClaim[];
  sources: ApiSource[];
  report: { id: string; title: string; markdown: string } | null;
  messages: { id: string; role: string; content: string }[];
  evaluations: {
    faithfulness: number | null;
    citation_accuracy: number | null;
    ablation_label: string | null;
  }[];
  live: boolean;
};

export function mapClaim(c: ApiClaim, sources: ApiSource[]) {
  const src = sources.find((s) => s.id === c.source_id);
  return {
    id: c.id,
    claim_code: c.claim_code,
    text: c.text,
    verdict: (c.verdict as
      | "supported"
      | "weak"
      | "contradicted"
      | "insufficient"
      | "pending") || "pending",
    confidence: c.confidence ?? 0,
    critic_notes: c.critic_notes ?? "",
    page_number: c.page_number,
    source_title:
      c.evidence?.source_title || src?.title || "—",
    span: c.evidence?.span || "",
    figure_or_table: c.evidence?.figure_or_table ?? null,
  };
}
