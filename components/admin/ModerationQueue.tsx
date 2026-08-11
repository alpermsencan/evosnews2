"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type QueueItem = {
  id: string;
  title: string;
  spot: string;
  slug: string;
  sourceName: string | null;
  sourceUrl: string | null;
  categoryName: string;
  hasImage: boolean;
  ingestedAt: string | null;
  publishedAt: string;
};

/**
 * Otomatik çekilen taslakların onay ekranı.
 * "Düzenle" editörü açar (metni kendi cümleleriyle yazar + görsel yükler),
 * "Yayınla" içeriği canlıya alır, "Reddet" kuyruktan düşürür ama kaydı tutar —
 * böylece aynı haber bir sonraki cron'da tekrar gelmez.
 */
export default function ModerationQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const act = async (id: string, action: "publish" | "reject") => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`"${title}" kalıcı olarak silinecek. Onaylıyor musunuz?`)) return;
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/moderation?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setBusy(null);
    }
  };

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
        <p className="text-sm font-bold text-neutral-600">Kuyruk boş</p>
        <p className="mt-1 text-[13px] text-neutral-400">
          Otomatik çekilen yeni haberler burada onay bekler.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded border border-evos/30 bg-evos/5 px-3 py-2 text-[13px] font-bold text-evos">
          {error}
        </p>
      )}

      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">
              {item.sourceName ?? "ELLE"}
            </span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
              {item.categoryName}
            </span>
            {!item.hasImage && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                GÖRSEL YOK
              </span>
            )}
            <span className="ml-auto text-[11px] text-neutral-400">
              {new Date(item.publishedAt).toLocaleString("tr-TR")}
            </span>
          </div>

          <div>
            <h3 className="text-[15px] font-black leading-snug text-neutral-900">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[13px] text-neutral-600">{item.spot}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => act(item.id, "publish")}
              disabled={busy === item.id}
              className="rounded bg-volt px-3 py-1.5 text-[12px] font-black text-white disabled:opacity-50"
            >
              Yayınla
            </button>
            <Link
              href={`/admin/haberler/${item.id}`}
              className="rounded bg-neutral-900 px-3 py-1.5 text-[12px] font-black text-white"
            >
              Düzenle
            </Link>
            <button
              onClick={() => act(item.id, "reject")}
              disabled={busy === item.id}
              className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-bold text-neutral-600 disabled:opacity-50"
            >
              Reddet
            </button>
            <button
              onClick={() => remove(item.id, item.title)}
              disabled={busy === item.id}
              className="rounded border border-evos/40 px-3 py-1.5 text-[12px] font-bold text-evos disabled:opacity-50"
            >
              Sil
            </button>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[12px] font-bold text-neutral-400 hover:text-evos"
              >
                Kaynağı aç ↗
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
