"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconEdit, IconTrash } from "@/components/ui/Icons";

export type AdminRow = {
  id: string;
  /** Silme onayında gösterilecek etiket */
  label: string;
  /** Tabloda arama için düz metin */
  search?: string;
  /** Sütun sırasına göre hücre içerikleri */
  cells: React.ReactNode[];
};

export default function AdminTable({
  columns,
  rows,
  endpoint,
  editBase,
  deleteQueryParam = false,
  searchable = true,
}: {
  columns: string[];
  rows: AdminRow[];
  endpoint: string;
  editBase?: string;
  /** true ise DELETE /endpoint?id=xxx, false ise DELETE /endpoint/xxx */
  deleteQueryParam?: boolean;
  searchable?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const filtered = q
    ? rows.filter((r) =>
        (r.search ?? r.label).toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  const remove = async (id: string, label: string) => {
    if (!confirm(`"${label}" silinecek. Onaylıyor musunuz?`)) return;
    setBusy(id);
    setError("");
    try {
      const url = deleteQueryParam ? `${endpoint}?id=${id}` : `${endpoint}/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {searchable && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tabloda ara..."
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-evos sm:max-w-xs"
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm font-bold text-evos">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3">
                  {c}
                </th>
              ))}
              <th className="px-4 py-3 text-right">İŞLEM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50">
                {row.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-3 align-top">
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-2">
                    {editBase && (
                      <Link
                        href={`${editBase}/${row.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-evos hover:text-evos"
                        title="Düzenle"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => remove(row.id, row.label)}
                      disabled={busy === row.id}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-evos hover:bg-evos hover:text-white disabled:opacity-50"
                      title="Sil"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <span className="text-xs text-neutral-400">
        Toplam {filtered.length} kayıt
      </span>
    </div>
  );
}
