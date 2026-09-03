"use client";

import { Claim, PipelineStep, Source } from "@/lib/demo-data";
import { StatusPill, VerdictBadge } from "./ui";

export function PipelineStepper({ steps }: { steps: PipelineStep[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step) => (
        <li key={step.name} className="flex items-start gap-2.5 text-sm">
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              step.status === "done"
                ? "bg-verdict-supported"
                : step.status === "running"
                  ? "live-dot bg-evidence"
                  : "bg-ink-600"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={
                  step.status === "pending" ? "text-mist-500" : "text-mist-100"
                }
              >
                {step.label}
              </span>
              {step.detail ? (
                <span className="font-mono text-[10px] text-mist-500">
                  {step.detail}
                </span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="space-y-2">
      {sources.map((s) => (
        <li
          key={s.id}
          className="rounded-lg border border-white/[0.05] bg-ink-900/60 p-2.5 transition hover:border-evidence/20"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs leading-snug text-mist-100">{s.title}</p>
            {s.pinned ? (
              <StatusPill label="pinned" tone="live" />
            ) : null}
          </div>
          <p className="mt-1 font-mono text-[10px] text-mist-500">
            {s.authors} · {s.year} · {s.source_type}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ClaimLedger({
  claims,
  selectedId,
  onSelect,
}: {
  claims: Claim[];
  selectedId?: string;
  onSelect: (claim: Claim) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <div className="grid grid-cols-[56px_1fr_110px_64px] gap-2 border-b border-white/[0.06] bg-ink-850 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-mist-500">
        <span>ID</span>
        <span>Claim</span>
        <span>Verdict</span>
        <span>Conf</span>
      </div>
      <ul className="max-h-[420px] divide-y divide-white/[0.04] overflow-y-auto scrollbar-thin">
        {claims.map((c) => {
          const active = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className={`grid w-full grid-cols-[56px_1fr_110px_64px] gap-2 px-3 py-3 text-left transition ${
                  active
                    ? "bg-evidence/10"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <span className="font-mono text-xs text-evidence-soft">
                  {c.claim_code}
                </span>
                <span className="text-xs leading-relaxed text-mist-200">
                  {c.text}
                </span>
                <span>
                  <VerdictBadge verdict={c.verdict} compact />
                </span>
                <span className="font-mono text-xs text-mist-400">
                  {(c.confidence * 100).toFixed(0)}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function EvidenceInspector({ claim }: { claim: Claim | null }) {
  if (!claim) {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-white/[0.08] bg-ink-850/40 p-6 text-center">
        <p className="text-sm text-mist-400">Evidence inspector</p>
        <p className="mt-2 text-xs leading-relaxed text-mist-500">
          Select a claim to inspect provenance: verdict, span, page, critic, and
          source binding.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto scrollbar-thin rounded-xl border border-white/[0.06] bg-ink-850/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-evidence-soft">
          {claim.claim_code}
        </span>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      <p className="text-sm leading-relaxed text-mist-100">{claim.text}</p>

      <div className="rounded-lg border border-evidence/20 bg-evidence/5 p-3">
        <div className="font-mono text-[9px] uppercase tracking-widest text-evidence-dim">
          Evidence span
        </div>
        <p className="mt-1.5 font-serif text-sm italic leading-relaxed text-mist-200">
          “{claim.span}”
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-ink-900/80 p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
            Page
          </div>
          <div className="mt-1 text-sm text-mist-100">
            {claim.page_number ?? "—"}
          </div>
        </div>
        <div className="rounded-lg bg-ink-900/80 p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
            Confidence
          </div>
          <div className="mt-1 text-sm text-mist-100">
            {(claim.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
          Source
        </div>
        <p className="mt-1 text-xs text-mist-200">{claim.source_title}</p>
        {claim.figure_or_table ? (
          <p className="mt-1 font-mono text-[10px] text-evidence-soft">
            {claim.figure_or_table}
          </p>
        ) : null}
      </div>

      {/* PDF preview mock */}
      <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#1a1f28]">
        <div className="border-b border-white/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-mist-500">
          Page preview
        </div>
        <div className="space-y-2 p-4 font-serif text-[11px] leading-5 text-mist-400">
          <div className="h-2 w-4/5 rounded bg-white/5" />
          <div className="h-2 w-full rounded bg-white/5" />
          <div className="rounded bg-evidence/20 px-2 py-1.5 text-evidence-soft ring-1 ring-evidence/40">
            {claim.span.slice(0, 110)}
            {claim.span.length > 110 ? "…" : ""}
          </div>
          <div className="h-2 w-3/4 rounded bg-white/5" />
          <div className="h-2 w-full rounded bg-white/5" />
        </div>
      </div>

      <div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
          Critic
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-mist-300">
          {claim.critic_notes}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {["Keep", "Weaken", "Abstain", "Pin"].map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-md border border-white/[0.08] bg-ink-900 px-2.5 py-1.5 text-[11px] text-mist-300 transition hover:border-evidence/30 hover:text-evidence-soft"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReportView({ markdown }: { markdown: string }) {
  const blocks = markdown.split("\n");
  return (
    <article className="prose-report mx-auto max-w-3xl font-serif text-[15px] leading-7 text-mist-200">
      {blocks.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="mb-4 mt-2 font-serif text-2xl font-semibold text-mist-100"
            >
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mb-3 mt-8 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-evidence-soft"
            >
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("|")) {
          return (
            <pre
              key={i}
              className="my-1 overflow-x-auto font-mono text-[11px] text-mist-400"
            >
              {line}
            </pre>
          );
        }
        if (!line.trim()) return <div key={i} className="h-3" />;
        const withClaims = line.split(/(\[C\d+\])/g).map((part, j) => {
          if (/^\[C\d+\]$/.test(part)) {
            return (
              <span
                key={j}
                className="mx-0.5 inline-flex cursor-pointer rounded bg-evidence/15 px-1.5 py-0.5 font-mono text-[10px] text-evidence-soft underline decoration-evidence/40 underline-offset-2"
              >
                {part}
              </span>
            );
          }
          return <span key={j}>{part}</span>;
        });
        return (
          <p key={i} className="mb-3">
            {withClaims}
          </p>
        );
      })}
    </article>
  );
}
