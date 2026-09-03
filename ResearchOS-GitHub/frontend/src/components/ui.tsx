import Link from "next/link";

export function VerdictBadge({
  verdict,
  compact = false,
}: {
  verdict: string;
  compact?: boolean;
}) {
  const map: Record<string, string> = {
    supported: "bg-verdict-supported/15 text-verdict-supported border-verdict-supported/30",
    weak: "bg-verdict-weak/15 text-verdict-weak border-verdict-weak/30",
    contradicted:
      "bg-verdict-contradicted/15 text-verdict-contradicted border-verdict-contradicted/30",
    insufficient:
      "bg-verdict-insufficient/15 text-verdict-insufficient border-verdict-insufficient/30",
    pending: "bg-white/5 text-mist-400 border-white/10",
  };
  const cls = map[verdict] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cls} ${
        compact ? "" : "px-2.5"
      }`}
    >
      {verdict}
    </span>
  );
}

export function TopBar({
  title = "ResearchOS",
  subtitle,
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-ink-900/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-evidence/20 text-sm font-semibold text-evidence-soft">
            R
          </span>
          <span className="text-sm font-semibold tracking-tight text-mist-100">
            {title}
          </span>
        </Link>
        {subtitle ? (
          <>
            <span className="text-mist-500">/</span>
            <span className="max-w-[280px] truncate text-sm text-mist-300">
              {subtitle}
            </span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}

export function Rail() {
  const items = [
    { href: "/library", label: "Library", icon: "◈" },
    { href: "/workspace", label: "Workspace", icon: "▣" },
    { href: "/documents", label: "Documents", icon: "▤" },
    { href: "/evaluation", label: "Eval", icon: "◫" },
  ];
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-ink-950 py-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-mist-400 transition hover:bg-white/[0.04] hover:text-evidence-soft"
        >
          <span className="text-base">{item.icon}</span>
        </Link>
      ))}
      <div className="mt-auto flex flex-col items-center gap-2 pb-2">
        <span className="rounded-full bg-evidence/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-evidence-soft">
          cloud
        </span>
      </div>
    </aside>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "live" | "good";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.03] text-mist-300",
    live: "border-evidence/30 bg-evidence/10 text-evidence-soft",
    good: "border-verdict-supported/30 bg-verdict-supported/10 text-verdict-supported",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${tones[tone]}`}
    >
      {tone === "live" ? (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-evidence" />
      ) : null}
      {label}
    </span>
  );
}

export function MetricChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-ink-850 px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-widest text-mist-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-mist-100">{value}</div>
    </div>
  );
}
