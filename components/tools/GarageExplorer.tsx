"use client";

import { useMemo, useState } from "react";

/**
 * DİJİTAL GARAJ GEZGİNİ
 *
 * Marka/model seçilir, o aracın yazılım özellikleri durumlarıyla listelenir.
 * Durum dört değerlidir çünkü gerçek dünyada özellik "var/yok" değildir:
 * aynı model donanım paketine göre özelliği taşımayabilir ya da özellik ayrı
 * abonelik isteyebilir. İkiye indirgemek kullanıcıyı yanıltırdı.
 */

export type Feature = {
  id: string;
  brand: string;
  model: string;
  name: string;
  status: string;
  note: string | null;
  vehicleSlug: string | null;
};

const STATUS_META: Record<string, { label: string; tone: string; weight: number }> = {
  AKTIF: { label: "Aktif", tone: "bg-volt/10 text-volt-dark", weight: 0 },
  ABONELIK: { label: "Abonelik gerektirir", tone: "bg-amber-100 text-amber-700", weight: 1 },
  OPSIYONEL: { label: "Opsiyonel", tone: "bg-blue-100 text-blue-700", weight: 2 },
  PASIF: { label: "Pasif", tone: "bg-neutral-200 text-neutral-600", weight: 3 },
};

export default function GarageExplorer({ features }: { features: Feature[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, { brand: string; model: string; items: Feature[] }>();
    for (const f of features) {
      const key = `${f.brand}|${f.model}`;
      const g = map.get(key) ?? { brand: f.brand, model: f.model, items: [] };
      g.items.push(f);
      map.set(key, g);
    }
    return [...map.values()].sort(
      (a, b) => b.items.length - a.items.length || a.brand.localeCompare(b.brand, "tr"),
    );
  }, [features]);

  const [selected, setSelected] = useState(0);
  const active = groups[selected];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
        <h3 className="text-base font-black text-neutral-800">
          Henüz özellik verisi girilmedi
        </h3>
        <p className="max-w-lg text-sm text-neutral-500">
          Dijital garaj, marka donanım listelerinden doğrulanarak doldurulur.
          Doğrulanmamış özellik listesi yayımlanmaz — bir aracın sahip olmadığı
          özelliği &quot;var&quot; göstermek, kullanıcının satın alma kararını
          yanlış bilgiyle etkilerdi.
        </p>
      </div>
    );
  }

  const counts = active.items.reduce(
    (acc, f) => {
      const key = f.status === "PASIF" ? "pasif" : f.status === "AKTIF" ? "aktif" : "kosullu";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sorted = [...active.items].sort(
    (a, b) =>
      (STATUS_META[a.status]?.weight ?? 9) - (STATUS_META[b.status]?.weight ?? 9) ||
      a.name.localeCompare(b.name, "tr"),
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <nav className="flex w-full shrink-0 flex-row gap-2 overflow-x-auto lg:w-[240px] lg:flex-col lg:overflow-visible">
        {groups.map((g, i) => (
          <button
            key={`${g.brand}-${g.model}`}
            type="button"
            onClick={() => setSelected(i)}
            aria-pressed={i === selected}
            className={`flex shrink-0 flex-col items-start rounded-lg border px-4 py-3 text-left transition lg:w-full ${
              i === selected
                ? "border-evos bg-evos/5"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <span className="text-[11px] font-bold text-neutral-400">{g.brand}</span>
            <span className="text-[14px] font-black text-neutral-900">{g.model}</span>
            <span className="text-[11px] text-neutral-500">
              {g.items.filter((f) => f.status === "AKTIF").length} aktif özellik
            </span>
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-black text-neutral-900">
            {active.brand} {active.model}
          </h3>
          <div className="flex gap-3 text-[12px] font-bold">
            <span className="text-volt-dark">{counts.aktif ?? 0} aktif</span>
            <span className="text-amber-600">{counts.kosullu ?? 0} koşullu</span>
            <span className="text-neutral-400">{counts.pasif ?? 0} pasif</span>
            <span className="text-neutral-600">{active.items.length} toplam</span>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-neutral-100">
          {sorted.map((f) => {
            const meta = STATUS_META[f.status] ?? {
              label: f.status,
              tone: "bg-neutral-100 text-neutral-600",
            };
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`text-[14px] font-bold ${
                      f.status === "PASIF" ? "text-neutral-400 line-through" : "text-neutral-800"
                    }`}
                  >
                    {f.name}
                  </span>
                  {f.note && (
                    <span className="text-[11px] text-neutral-400">{f.note}</span>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-1 text-[10px] font-black ${meta.tone}`}
                >
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
