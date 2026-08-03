"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = [
  { value: "uye", label: "Üye" },
  { value: "editor", label: "Editör" },
  { value: "admin", label: "Admin" },
];

/** Üye tablosunda rol seçimi ve askıya alma anahtarı */
export default function UserRowActions({
  id,
  role,
  isBanned,
}: {
  id: string;
  role: string;
  isBanned: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);
  const [banned, setBanned] = useState(isBanned);

  const update = async (data: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        disabled={busy}
        onChange={(e) => {
          setCurrentRole(e.target.value);
          void update({ role: e.target.value });
        }}
        className="rounded-md border border-neutral-300 px-2 py-1 text-[12px] outline-none focus:border-evos"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          const next = !banned;
          setBanned(next);
          void update({ isBanned: next });
        }}
        disabled={busy}
        className={`rounded-md border px-2.5 py-1 text-[11px] font-black transition disabled:opacity-50 ${
          banned
            ? "border-evos bg-evos text-white"
            : "border-neutral-300 text-neutral-500 hover:border-evos hover:text-evos"
        }`}
      >
        {banned ? "ASKIDA" : "ASKIYA AL"}
      </button>
    </div>
  );
}
