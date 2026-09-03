"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Rail, TopBar, MetricChip, StatusPill } from "@/components/ui";
import { api, ensureSession } from "@/lib/api";

type SessionRow = {
  id: string;
  title: string;
  research_question: string;
  status: string;
  depth: string;
  cost_usd: number;
  confidence: number | null;
  updated_at: string;
};

const DEFAULT_Q =
  "Compare recent approaches for reducing hallucinations in Retrieval-Augmented Generation systems.";

export default function LibraryPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState("deep");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        const rows = await api<SessionRow[]>("/api/research");
        setSessions(rows);
      } catch {
        /* API not up yet — library still usable to attempt compile */
      }
    })();
  }, []);

  async function startResearch() {
    setError("");
    setBusy(true);
    try {
      await ensureSession();
      const ws = await api<{ session: { id: string } }>("/api/research/compile", {
        method: "POST",
        body: JSON.stringify({
          question: question.trim() || DEFAULT_Q,
          depth,
          citation_required: true,
        }),
      });
      router.push(`/workspace?id=${ws.session.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Compile failed. Is the API running on port 8000?",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-ink-900">
      <TopBar
        right={
          <>
            <StatusPill label={busy ? "compiling" : "live cockpit"} tone="live" />
            <button
              type="button"
              onClick={startResearch}
              disabled={busy}
              className="rounded-lg bg-evidence px-3 py-1.5 text-xs font-semibold text-ink-950 disabled:opacity-50"
            >
              {busy ? "Compiling…" : "New research"}
            </button>
          </>
        }
      />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6 md:p-10">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold tracking-tight text-mist-100">
              Research library
            </h1>
            <p className="mt-1 text-sm text-mist-400">
              Ask a question. ResearchOS compiles a claim ledger, not a chat blob.
            </p>

            <div className="panel mt-8 p-5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-mist-500">
                What should we research?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder={DEFAULT_Q}
                className="mt-3 w-full resize-none rounded-xl border border-white/[0.08] bg-ink-900 px-4 py-3 text-sm text-mist-100 outline-none transition placeholder:text-mist-500 focus:border-evidence/40 focus:ring-2 focus:ring-evidence/20"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(["quick", "standard", "deep", "exhaustive"] as const).map(
                    (d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDepth(d)}
                        className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                          depth === d
                            ? "border-evidence/40 bg-evidence/15 text-evidence-soft"
                            : "border-white/10 text-mist-400 hover:text-mist-200"
                        }`}
                      >
                        {d}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  onClick={startResearch}
                  disabled={busy}
                  className="rounded-lg bg-evidence px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-evidence-soft disabled:opacity-50"
                >
                  {busy ? "Compiling evidence…" : "Start research"}
                </button>
              </div>
              {error ? (
                <p className="mt-3 text-xs text-verdict-contradicted">{error}</p>
              ) : (
                <p className="mt-3 font-mono text-[10px] text-mist-500">
                  Semantic Scholar + uploaded corpus + claim verification. Cloud LLM
                  if OPENAI_API_KEY is set; otherwise seed-grounded compile.
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MetricChip label="Sessions" value={String(sessions.length)} />
              <MetricChip label="Pipeline" value="plan→verify" />
              <MetricChip label="Citations" value="required" />
            </div>

            <h2 className="mt-10 font-mono text-[10px] uppercase tracking-widest text-mist-500">
              Continue
            </h2>
            <div className="mt-3 space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-mist-500">
                  No compiles yet. Start from the prompt above.
                </p>
              ) : (
                sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/workspace?id=${s.id}`}
                    className="panel block p-4 transition hover:border-evidence/25"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-mist-100">
                          {s.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-mist-400">
                          {s.research_question}
                        </p>
                      </div>
                      <StatusPill
                        label={s.status}
                        tone={s.status === "completed" ? "good" : "live"}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 font-mono text-[10px] text-mist-500">
                      <span>{s.depth}</span>
                      <span>${(s.cost_usd || 0).toFixed(3)}</span>
                      {s.confidence != null ? (
                        <span>confidence {(s.confidence * 100).toFixed(0)}%</span>
                      ) : null}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
