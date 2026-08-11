"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type SourceRow = {
  id: string;
  key: string;
  name: string;
  kind: string;
  endpoint: string | null;
  categorySlug: string | null;
  keywords: string[];
  isActive: boolean;
  autoPublish: boolean;
  schedule: string;
  lastRunAt: string | null;
  lastOkAt: string | null;
  lastError: string | null;
  /** Son çalışmanın özeti */
  lastRun: {
    status: string;
    fetched: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    durationMs: number;
  } | null;
};

const KIND_LABEL: Record<string, string> = {
  news: "Haber",
  stations: "Şarj İstasyonu",
  fx: "Döviz",
  prices: "Fiyat",
};

/** Verinin ne kadar bayat olduğunu insan diliyle söyler. */
function freshness(lastOkAt: string | null) {
  if (!lastOkAt) return { text: "Hiç çalışmadı", tone: "bg-neutral-200 text-neutral-600" };

  const diffMin = Math.round((Date.now() - new Date(lastOkAt).getTime()) / 60000);
  if (diffMin < 60) return { text: `${diffMin} dk önce`, tone: "bg-volt text-white" };

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return { text: `${diffHour} saat önce`, tone: "bg-volt text-white" };

  const diffDay = Math.round(diffHour / 24);
  return {
    text: `${diffDay} gün önce`,
    tone: diffDay > 7 ? "bg-evos text-white" : "bg-amber-500 text-white",
  };
}

export default function SourcePanel({ sources }: { sources: SourceRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = async (id: string, patch: Record<string, unknown>) => {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/sources", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi");
    } finally {
      setBusy(null);
    }
  };

  const runNow = async (key: string) => {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Çalıştırılamadı");

      const o = data.outcome;
      setMessage(
        o.status === "skipped"
          ? `${key}: atlandı — ${o.error ?? "kaynak pasif"}`
          : `${key}: ${o.stats.created} yeni, ${o.stats.updated} güncellenen, ${o.stats.skipped} atlanan (${o.durationMs} ms)`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çalıştırılamadı");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {message && (
        <p className="rounded border border-volt/40 bg-volt/10 px-3 py-2 text-[13px] font-bold text-neutral-700">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded border border-evos/30 bg-evos/5 px-3 py-2 text-[13px] font-bold text-evos">
          {error}
        </p>
      )}

      {sources.map((s) => {
        const fresh = freshness(s.lastOkAt);
        return (
          <article
            key={s.id}
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-black text-neutral-900">{s.name}</span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                {KIND_LABEL[s.kind] ?? s.kind}
              </span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-black ${fresh.tone}`}>
                {fresh.text}
              </span>
              {!s.isActive && (
                <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] font-black text-neutral-600">
                  PASİF
                </span>
              )}
              {s.autoPublish && (
                <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                  OTOMATİK YAYIN
                </span>
              )}
              <code className="ml-auto text-[11px] text-neutral-400">{s.schedule}</code>
            </div>

            {s.endpoint && (
              <p className="truncate text-[11px] text-neutral-400">{s.endpoint}</p>
            )}

            {s.lastRun && (
              <p className="text-[12px] text-neutral-600">
                Son çalışma: <b>{s.lastRun.fetched}</b> çekildi · <b>{s.lastRun.created}</b> yeni ·{" "}
                <b>{s.lastRun.updated}</b> güncellendi · <b>{s.lastRun.skipped}</b> atlandı
                {s.lastRun.failed > 0 && (
                  <span className="text-evos"> · {s.lastRun.failed} hata</span>
                )}{" "}
                <span className="text-neutral-400">({s.lastRun.durationMs} ms)</span>
              </p>
            )}

            {s.lastError && (
              <p className="rounded bg-evos/5 px-2 py-1 text-[12px] font-bold text-evos">
                Hata: {s.lastError}
              </p>
            )}

            {s.keywords.length > 0 && (
              <p className="text-[11px] text-neutral-500">
                Filtre: {s.keywords.join(", ")}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => runNow(s.key)}
                disabled={busy === s.key}
                className="rounded bg-neutral-900 px-3 py-1.5 text-[12px] font-black text-white disabled:opacity-50"
              >
                {busy === s.key ? "Çalışıyor…" : "Şimdi çalıştır"}
              </button>
              <button
                onClick={() => update(s.id, { isActive: !s.isActive })}
                disabled={busy === s.id}
                className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-bold text-neutral-600 disabled:opacity-50"
              >
                {s.isActive ? "Pasifleştir" : "Aktifleştir"}
              </button>
              {s.kind === "news" && (
                <button
                  onClick={() => update(s.id, { autoPublish: !s.autoPublish })}
                  disabled={busy === s.id}
                  className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-bold text-neutral-600 disabled:opacity-50"
                  title="Açıkken çekilen haberler moderasyon kuyruğuna uğramadan yayınlanır"
                >
                  {s.autoPublish ? "Otomatik yayını kapat" : "Otomatik yayını aç"}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
