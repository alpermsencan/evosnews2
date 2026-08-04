"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/user/Avatar";
import type { PersonSummary } from "./types";

/** Akış kenarındaki "tanıyor olabilirsin" kutusu */
export default function SuggestionList({
  people,
  title = "TANIYOR OLABİLİRSİN",
}: {
  people: PersonSummary[];
  title?: string;
}) {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  if (people.length === 0) return null;

  const add = async (p: PersonSummary) => {
    setBusy(p.id);
    try {
      const res = await fetch(`/api/users/${p.username}/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request" }),
      });
      if (res.ok) setSent((s) => ({ ...s, [p.id]: true }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black tracking-wide text-neutral-800">
          {title}
        </h2>
        <Link
          href="/arkadaslar?sekme=oneriler"
          className="text-[11px] font-black text-evos hover:underline"
        >
          TÜMÜ
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-2.5">
            <Link href={`/profil/${p.username}`} className="shrink-0">
              <Avatar src={p.avatar} name={p.name} size="sm" />
            </Link>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <Link
                href={`/profil/${p.username}`}
                className="truncate text-[13px] font-black text-neutral-800 hover:text-evos"
              >
                {p.name}
              </Link>
              <span className="truncate text-[11px] font-bold text-neutral-400">
                {(p.mutualCount ?? 0) > 0
                  ? `${p.mutualCount} ortak arkadaş`
                  : `@${p.username}`}
              </span>
            </span>
            <button
              onClick={() => void add(p)}
              disabled={busy === p.id || sent[p.id]}
              className={`shrink-0 rounded-md px-3 py-1.5 text-[11px] font-black transition ${
                sent[p.id]
                  ? "border border-neutral-200 text-neutral-400"
                  : "bg-neutral-900 text-white hover:bg-evos"
              } disabled:opacity-60`}
            >
              {sent[p.id] ? "GÖNDERİLDİ" : busy === p.id ? "..." : "EKLE"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
