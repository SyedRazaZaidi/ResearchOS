"use client";

import { useEffect, useRef, useState } from "react";
import { Rail, TopBar, StatusPill } from "@/components/ui";
import { api, ensureSession } from "@/lib/api";

type Doc = {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  page_count: number | null;
};

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    await ensureSession();
    const rows = await api<Doc[]>("/api/documents");
    setDocs(rows);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      await ensureSession();
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        await api("/api/documents", { method: "POST", body });
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-ink-900">
      <TopBar
        subtitle="Documents"
        right={
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-evidence px-3 py-1.5 text-xs font-semibold text-ink-950"
          >
            Upload
          </button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
        onChange={(e) => onFiles(e.target.files)}
      />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin md:p-10">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold">Document intelligence</h1>
            <p className="mt-1 text-sm text-mist-400">
              Parsed into structure-aware chunks and available to the next compile.
            </p>
            {error ? (
              <p className="mt-4 text-xs text-verdict-contradicted">{error}</p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {docs.map((d) => (
                <div key={d.id} className="panel p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-mist-100">{d.filename}</h3>
                    <StatusPill
                      label={d.status}
                      tone={d.status === "indexed" ? "good" : "live"}
                    />
                  </div>
                  <div className="mt-3 font-mono text-[10px] text-mist-500">
                    {d.file_type}
                    {d.page_count != null ? ` · ${d.page_count} pages` : ""}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="panel mt-8 w-full border-dashed p-8 text-center"
            >
              <p className="text-sm text-mist-300">
                {busy ? "Ingesting…" : "Drop PDFs, DOCX, or Markdown — or click to upload"}
              </p>
              <p className="mt-2 font-mono text-[10px] text-mist-500">
                Max 50 MB · treated as untrusted data (prompt-injection isolated)
              </p>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
