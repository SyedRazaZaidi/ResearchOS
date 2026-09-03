import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid-fade">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-evidence/20 text-sm font-bold text-evidence-soft">
            R
          </span>
          <span className="text-sm font-semibold tracking-tight">ResearchOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="text-sm text-mist-400 transition hover:text-mist-100"
          >
            Enter library
          </Link>
          <Link
            href="/workspace"
            className="rounded-lg bg-evidence px-3.5 py-2 text-sm font-medium text-ink-950 transition hover:bg-evidence-soft"
          >
            Open cockpit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-evidence-soft">
          Evidence operating system
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-mist-100 md:text-6xl">
          Compile a research question into{" "}
          <span className="gold-text">verified claims</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist-400">
          Not a chatbot. A research instrument — plan, retrieve, critique, verify,
          cite, then generate. Every sentence is auditable. Abstention beats
          invention.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/library"
            className="rounded-xl bg-evidence px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-evidence-soft"
          >
            Launch research workspace
          </Link>
          <Link
            href="/evaluation"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-mist-200 transition hover:border-evidence/30"
          >
            View ablation dashboard
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Claim ledger",
              body: "Every finding is a Claim with verdict, span, page, and critic notes. No ID — no report line.",
            },
            {
              title: "Evidence inspector",
              body: "Click a sentence. See the PDF highlight, figure/table binding, and contradiction map.",
            },
            {
              title: "Eval as product",
              body: "Faithfulness, citation accuracy, latency, cost — ablation A→E on a live experiment console.",
            },
          ].map((card) => (
            <div key={card.title} className="panel p-5">
              <h3 className="text-sm font-semibold text-mist-100">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Cockpit preview */}
        <div className="panel mt-16 overflow-hidden shadow-glow">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-xs text-mist-400">Workspace preview</span>
            <span className="font-mono text-[10px] text-evidence-soft">
              $0.018 · 4.8s · faithfulness 93%
            </span>
          </div>
          <div className="grid md:grid-cols-[0.9fr_1.4fr_1fr]">
            <div className="border-r border-white/[0.05] p-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
                Pipeline
              </p>
              <ul className="mt-3 space-y-2 text-xs text-mist-300">
                {[
                  "Planning",
                  "Searching",
                  "Retrieval",
                  "Analysis",
                  "Verification",
                  "Report",
                ].map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < 5 ? "bg-verdict-supported" : "bg-evidence"
                      }`}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-r border-white/[0.05] p-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
                Claim · C3
              </p>
              <p className="mt-3 font-serif text-sm leading-relaxed text-mist-200">
                Claim-level citation verification catches unsupported sentences
                that passage retrieval alone misses.
              </p>
              <span className="mt-3 inline-flex rounded-full border border-verdict-supported/30 bg-verdict-supported/10 px-2 py-0.5 font-mono text-[10px] uppercase text-verdict-supported">
                supported
              </span>
            </div>
            <div className="bg-ink-900/50 p-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
                Page 12 · highlight
              </p>
              <div className="mt-3 space-y-2">
                <div className="h-2 w-full rounded bg-white/5" />
                <div className="rounded bg-evidence/20 p-2 text-[11px] italic text-evidence-soft ring-1 ring-evidence/30">
                  Sentence-level entailment checks reduced unsupported claims…
                </div>
                <div className="h-2 w-4/5 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[11px] tracking-wide text-mist-500">
          Evidence before generation · Verification before confidence · Evaluation
          before claims
        </p>
      </main>
    </div>
  );
}
