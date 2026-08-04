"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import Avatar from "@/components/user/Avatar";
import { IconUsers } from "@/components/ui/Icons";
import type { PersonSummary } from "./types";

type Tab = "friends" | "incoming" | "outgoing" | "suggestions";

const TABS: { key: Tab; label: string }[] = [
  { key: "friends", label: "Arkadaşlarım" },
  { key: "incoming", label: "Gelen istekler" },
  { key: "outgoing", label: "Gönderdiklerim" },
  { key: "suggestions", label: "Tanıyor olabilirsin" },
];

type Data = Record<Tab, PersonSummary[]>;

const EMPTY: Data = {
  friends: [],
  incoming: [],
  outgoing: [],
  suggestions: [],
};

const EMPTY_TEXT: Record<Tab, string> = {
  friends:
    "Henüz arkadaşın yok. Önerilerden başlayarak elektrikli araç topluluğunu genişlet.",
  incoming: "Bekleyen arkadaşlık isteğin yok.",
  outgoing: "Gönderdiğin ve onay bekleyen istek yok.",
  suggestions: "Şimdilik önerecek yeni kimse bulamadık.",
};

/** Arkadaş merkezi: listeler, istekler ve öneriler tek yerde */
export default function FriendHub({
  initial,
  initialTab = "friends",
}: {
  initial: Data;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [data, setData] = useState<Data>({ ...EMPTY, ...initial });
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      const json = await res.json();
      setData({ ...EMPTY, ...json });
    } catch {
      /* sessizce geç */
    }
  }, []);

  // İlk veri sunucudan geldiği için açılışta tekrar çekilmez;
  // listeler yalnızca bir işlem sonrası tazelenir.
  const act = async (person: PersonSummary, action: string) => {
    setBusyId(person.id);
    try {
      await fetch(`/api/users/${person.username}/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const list = data[tab] ?? [];

  const actionsFor = () => {
    switch (tab) {
      case "incoming":
        return [
          { label: "KABUL ET", action: "accept", primary: true },
          { label: "REDDET", action: "reject", primary: false },
        ];
      case "outgoing":
        return [{ label: "İSTEĞİ GERİ ÇEK", action: "cancel", primary: false }];
      case "friends":
        return [{ label: "ARKADAŞLIKTAN ÇIKAR", action: "remove", primary: false }];
      default:
        return [{ label: "ARKADAŞ EKLE", action: "request", primary: true }];
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sekmeler */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1">
        {TABS.map((t) => {
          const count = data[t.key]?.length ?? 0;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-md px-4 py-2 text-[12px] font-black transition ${
                active
                  ? "bg-evos text-white"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/25" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center">
          <IconUsers className="h-8 w-8 text-neutral-300" />
          <p className="max-w-md text-sm text-neutral-500">{EMPTY_TEXT[tab]}</p>
          {tab === "friends" && (
            <button
              onClick={() => setTab("suggestions")}
              className="rounded-md bg-evos px-5 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark"
            >
              ÖNERİLERE GÖZ AT
            </button>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
            >
              <Link href={`/profil/${p.username}`} className="shrink-0">
                <Avatar src={p.avatar} name={p.name} size="md" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/profil/${p.username}`}
                  className="truncate text-[14px] font-black text-neutral-900 hover:text-evos"
                >
                  {p.name}
                </Link>
                <span className="truncate text-[11px] font-bold text-neutral-400">
                  @{p.username}
                  {p.city ? ` · ${p.city}` : ""}
                </span>
                {tab === "suggestions" && (p.mutualCount ?? 0) > 0 && (
                  <span className="text-[11px] font-bold text-volt">
                    {p.mutualCount} ortak arkadaş
                  </span>
                )}
                {p.bio && (
                  <span className="line-clamp-1 text-[11px] text-neutral-500">
                    {p.bio}
                  </span>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                {actionsFor().map((a) => (
                  <button
                    key={a.action}
                    onClick={() => void act(p, a.action)}
                    disabled={busyId === p.id}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-black transition disabled:opacity-50 ${
                      a.primary
                        ? "bg-evos text-white hover:bg-evos-dark"
                        : "border border-neutral-300 text-neutral-500 hover:border-evos hover:text-evos"
                    }`}
                  >
                    {busyId === p.id ? "..." : a.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
