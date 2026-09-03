"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ClaimLedger,
  EvidenceInspector,
  PipelineStepper,
  ReportView,
  SourceList,
} from "@/components/research";
import { MetricChip, Rail, StatusPill, TopBar } from "@/components/ui";
import { api, ensureSession, mapClaim, type ApiWorkspace } from "@/lib/api";
import {
  Claim,
  DEMO_CLAIMS,
  DEMO_PIPELINE,
  DEMO_REPORT,
  DEMO_SESSION,
  DEMO_SOURCES,
  type Source,
} from "@/lib/demo-data";

type Mode =
  | "chat"
  | "plan"
  | "papers"
  | "evidence"
  | "report"
  | "compare"
  | "graph";

const MODES: { id: Mode; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "plan", label: "Plan" },
  { id: "papers", label: "Papers" },
  { id: "evidence", label: "Evidence" },
  { id: "report", label: "Report" },
  { id: "compare", label: "Compare" },
  { id: "graph", label: "Graph" },
];

function WorkspaceInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [mode, setMode] = useState<Mode>("evidence");
  const [ws, setWs] = useState<ApiWorkspace | null>(null);
  const [claims, setClaims] = useState<Claim[]>(DEMO_CLAIMS);
  const [sources, setSources] = useState<Source[]>(DEMO_SOURCES);
  const [selected, setSelected] = useState<Claim | null>(DEMO_CLAIMS[2]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await ensureSession();
        const data = await api<ApiWorkspace>(`/api/research/${id}/workspace`);
        setWs(data);
        const mapped = data.claims.map((c) => mapClaim(c, data.sources));
        setClaims(mapped);
        setSources(
          data.sources.map((s) => ({
            id: s.id,
            title: s.title,
            authors: s.authors || "—",
            year: s.publication_date || "",
            source_type: s.source_type,
            pinned: s.pinned,
          })),
        );
        setSelected(mapped[0] ?? null);
      } catch {
        /* keep demo fixtures */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const sessionTitle = ws?.session.title ?? DEMO_SESSION.title;
  const question = ws?.session.research_question ?? DEMO_SESSION.question;
  const status = ws?.session.status ?? DEMO_SESSION.status;
  const cost = ws?.session.cost_usd ?? DEMO_SESSION.cost_usd;
  const latency = ((ws?.session.latency_ms ?? DEMO_SESSION.latency_s * 1000) / 1000).toFixed(1);
  const confidence = ws?.session.confidence ?? DEMO_SESSION.confidence;
  const reportMd = ws?.report?.markdown ?? DEMO_REPORT;
  const planBranches =
    ws?.session.plan?.branches?.map((b) => b.label) ??
    [
      "Existing approaches",
      "Methodologies",
      "Datasets & benchmarks",
      "Evaluation metrics",
      "Limitations",
      "Research gaps",
    ];

  const pipeline = useMemo(() => {
    if (!ws) return DEMO_PIPELINE;
    return DEMO_PIPELINE.map((step) => ({ ...step, status: "done" as const }));
  }, [ws]);

  async function sendFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !id) {
      setChatInput("");
      return;
    }
    const text = chatInput.trim();
    setChatInput("");
    try {
      await ensureSession();
      await api(`/api/research/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      const data = await api<ApiWorkspace>(`/api/research/${id}/workspace`);
      setWs(data);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex h-screen flex-col bg-ink-900">
      <TopBar
        subtitle={sessionTitle}
        right={
          <>
            <StatusPill
              label={loading ? "loading" : status}
              tone={status === "completed" ? "good" : "live"}
            />
            <span className="hidden font-mono text-[10px] text-mist-400 sm:inline">
              ${cost.toFixed(3)} · {latency}s
              {ws?.live ? " · live" : ""}
            </span>
          </>
        }
      />

      <div className="flex min-h-0 flex-1">
        <Rail />
        <aside className="hidden w-[260px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-white/[0.06] bg-ink-950/80 p-4 scrollbar-thin xl:flex">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
              Research question
            </div>
            <p className="mt-2 text-xs leading-relaxed text-mist-200">{question}</p>
          </div>
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-mist-500">
              Pipeline
            </div>
            <PipelineStepper steps={pipeline} />
          </div>
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-mist-500">
              Plan branches
            </div>
            <ul className="space-y-1.5">
              {planBranches.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-mist-300">
                  <input type="checkbox" defaultChecked className="accent-evidence" readOnly />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-mist-500">
              Sources
            </div>
            <SourceList sources={sources} />
          </div>
          <div className="mt-auto">
            <MetricChip
              label="System confidence"
              value={`${(confidence * 100).toFixed(0)}%`}
            />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2 scrollbar-thin">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${
                  mode === m.id
                    ? "bg-evidence/15 text-evidence-soft"
                    : "text-mist-400 hover:text-mist-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin md:p-6">
            {mode === "evidence" && (
              <div>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-mist-100">Claim ledger</h2>
                    <p className="text-xs text-mist-400">
                      No claim ID → it does not enter the report.
                    </p>
                  </div>
                  <StatusPill
                    label={`${claims.length} claims`}
                    tone="live"
                  />
                </div>
                <ClaimLedger
                  claims={claims}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                />
              </div>
            )}

            {mode === "report" && <ReportView markdown={reportMd} />}

            {mode === "chat" && (
              <div className="mx-auto flex h-full max-w-2xl flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                  {(ws?.messages.length
                    ? ws.messages
                    : [
                        { id: "u", role: "user", content: question },
                        {
                          id: "a",
                          role: "assistant",
                          content:
                            "Compile complete. Open Evidence for the claim ledger.",
                        },
                      ]
                  ).map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-4 text-sm text-mist-200 ${
                        m.role === "assistant"
                          ? "border-evidence/20 bg-evidence/5"
                          : "border-white/[0.06] bg-ink-850"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-mist-500">
                        {m.role.toUpperCase()}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2" onSubmit={sendFollowUp}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a follow-up…"
                    className="flex-1 rounded-xl border border-white/[0.08] bg-ink-850 px-4 py-3 text-sm outline-none focus:border-evidence/40"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-evidence px-4 text-sm font-semibold text-ink-950"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {mode === "plan" && (
              <ol className="mx-auto max-w-2xl space-y-3">
                {planBranches.map((b, i) => (
                  <li key={b} className="panel flex items-center gap-3 p-3 text-sm">
                    <span className="font-mono text-evidence-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {b}
                  </li>
                ))}
              </ol>
            )}

            {mode === "papers" && (
              <div className="space-y-3">
                {sources.map((s) => (
                  <div key={s.id} className="panel p-4">
                    <h3 className="text-sm text-mist-100">{s.title}</h3>
                    <p className="mt-1 font-mono text-[10px] text-mist-500">
                      {s.authors} · {s.year} · {s.source_type}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {mode === "compare" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
                    <th className="p-3">Paper</th>
                    <th className="p-3">Authors</th>
                    <th className="p-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.id} className="border-t border-white/[0.04] text-mist-200">
                      <td className="p-3">{s.title}</td>
                      <td className="p-3">{s.authors}</td>
                      <td className="p-3">{s.source_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {mode === "graph" && (
              <div className="panel relative flex min-h-[420px] items-center justify-center">
                <p className="max-w-sm text-center text-xs text-mist-400">
                  {sources.length} sources · {claims.length} claims. Click Evidence to
                  inspect provenance for each node in the ledger.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="hidden w-[320px] shrink-0 border-l border-white/[0.06] bg-ink-950/50 p-4 lg:block">
          <EvidenceInspector claim={selected} />
        </aside>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-ink-900 text-sm text-mist-400">
          Loading cockpit…
        </div>
      }
    >
      <WorkspaceInner />
    </Suspense>
  );
}
