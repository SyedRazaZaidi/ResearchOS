"use client";

import { useEffect, useState } from "react";
import { Rail, TopBar, StatusPill, MetricChip } from "@/components/ui";
import { ABLATIONS } from "@/lib/demo-data";
import { api, ensureSession } from "@/lib/api";

type Dash = {
  headline: {
    faithfulness: number;
    citation_accuracy: number;
    recall_at_5: number;
    avg_latency_s: number;
    avg_cost_usd: number;
  };
  recent_runs: {
    faithfulness: number | null;
    citation_accuracy: number | null;
    ablation_label: string | null;
    latency_ms: number | null;
    cost_usd: number | null;
  }[];
};

export default function EvaluationPage() {
  const maxFaith = Math.max(...ABLATIONS.map((a) => a.faithfulness));
  const [dash, setDash] = useState<Dash | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        setDash(await api<Dash>("/api/evaluation/dashboard"));
      } catch {
        /* keep ablation fixtures */
      }
    })();
  }, []);

  const h = dash?.headline;

  return (
    <div className="flex h-screen flex-col bg-ink-900">
      <TopBar
        subtitle="Evaluation"
        right={<StatusPill label="experiment console" tone="live" />}
      />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin md:p-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              Evaluation dashboard
            </h1>
            <p className="mt-1 text-sm text-mist-400">
              Evaluation before claims — ablation A→E on the same questions.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricChip
                label="Faithfulness"
                value={h ? `${(h.faithfulness * 100).toFixed(0)}%` : "94%"}
              />
              <MetricChip
                label="Citation accuracy"
                value={h ? `${(h.citation_accuracy * 100).toFixed(0)}%` : "95%"}
              />
              <MetricChip
                label="Recall@5"
                value={h ? `${(h.recall_at_5 * 100).toFixed(0)}%` : "91%"}
              />
              <MetricChip
                label="Avg latency"
                value={h ? `${h.avg_latency_s}s` : "4.8s"}
              />
              <MetricChip
                label="Avg cost"
                value={h ? `$${h.avg_cost_usd.toFixed(3)}` : "$0.018"}
              />
            </div>

            <div className="panel mt-10 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Ablation faithfulness</h2>
                <span className="font-mono text-[10px] text-mist-500">
                  illustrative until gold runs wired
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {ABLATIONS.map((a) => (
                  <div key={a.label} className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
                    <span className="font-mono text-[11px] text-mist-400">
                      {a.label}
                    </span>
                    <div className="h-3 overflow-hidden rounded-full bg-ink-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-evidence-dim to-evidence-soft"
                        style={{
                          width: `${(a.faithfulness / maxFaith) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-xs text-mist-200">
                      {a.faithfulness}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-ink-850 font-mono text-[9px] uppercase tracking-widest text-mist-500">
                  <tr>
                    <th className="p-3">System</th>
                    <th className="p-3">Faithfulness</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3">Citation</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {ABLATIONS.map((a) => (
                    <tr
                      key={a.label}
                      className="border-t border-white/[0.04] text-mist-200 hover:bg-white/[0.02]"
                    >
                      <td className="p-3">{a.label}</td>
                      <td className="p-3 font-mono">{a.faithfulness}%</td>
                      <td className="p-3 font-mono">{a.recall}%</td>
                      <td className="p-3 font-mono">{a.citation}%</td>
                      <td className="p-3 font-mono">{a.latency}s</td>
                      <td className="p-3 font-mono">${a.cost.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {dash?.recent_runs?.length ? (
              <div className="panel mt-6 p-4">
                <h2 className="text-sm font-semibold">This machine’s runs</h2>
                <ul className="mt-3 space-y-2 font-mono text-[11px] text-mist-400">
                  {dash.recent_runs.slice(0, 8).map((r, i) => (
                    <li key={i}>
                      {r.ablation_label ?? "run"} · faith{" "}
                      {r.faithfulness != null
                        ? `${(r.faithfulness * 100).toFixed(0)}%`
                        : "—"}{" "}
                      · cite{" "}
                      {r.citation_accuracy != null
                        ? `${(r.citation_accuracy * 100).toFixed(0)}%`
                        : "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-6 max-w-2xl text-xs leading-relaxed text-mist-500">
              Primary research question: does claim-level verification + critic
              loop reduce unsupported claims versus hybrid RAG + reranker, and
              what does it cost in latency and spend?
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
