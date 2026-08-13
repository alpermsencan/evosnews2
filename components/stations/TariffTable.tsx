"use client";

import { useMemo, useState } from "react";
import { formatTariff, tierPrice, TIERS, type TariffLike, type TierKey } from "@/lib/tariffs";

/**
 * Operatör tarife tablosu.
 *
 * Sıralama ve arama istemcide yapılır: liste 60-70 satır civarında kalıyor,
 * her sıralama için sunucuya gitmek gereksiz gecikme olurdu.
 *
 * Fiyatı olmayan operatör sıralamada HER ZAMAN sona düşer — "—" değeri 0
 * sayılırsa ucuzdan pahalıya sıralamada en üste çıkar ve o operatör en ucuzmuş
 * gibi görünürdü.
 */

type SortKey = "operator" | TierKey;

export default function TariffTable({
  tariffs,
  cheapest,
}: {
  tariffs: TariffLike[];
  /** Kademe bazında en düşük fiyat — rozetlemek için. */
  cheapest: Partial<Record<TierKey, number>>;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("ac");

  const rows = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr-TR");
    const filtered = needle
      ? tariffs.filter((t) => t.operator.toLocaleLowerCase("tr-TR").includes(needle))
      : tariffs;

    return [...filtered].sort((a, b) => {
      if (sort === "operator") return a.operator.localeCompare(b.operator, "tr");
      const av = tierPrice(a, sort).min;
      const bv = tierPrice(b, sort).min;
      if (av == null && bv == null) return a.operator.localeCompare(b.operator, "tr");
      if (av == null) return 1;
      if (bv == null) return -1;
      return av - bv;
    });
  }, [tariffs, q, sort]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Operatör ara…"
          aria-label="Operatör ara"
          className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-volt sm:max-w-[280px]"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-neutral-400">SIRALA:</span>
          {(
            [
              { key: "ac", label: "AC" },
              { key: "dc", label: "DC" },
              { key: "ultra", label: "ULTRA" },
              { key: "operator", label: "A-Z" },
            ] as const
          ).map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSort(o.key)}
              aria-pressed={sort === o.key}
              className={`rounded px-2.5 py-1.5 text-[11px] font-black transition ${
                sort === o.key
                  ? "bg-volt text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">OPERATÖR</th>
              {TIERS.map((t) => (
                <th key={t.key} className="px-4 py-3 text-right">
                  {t.label}
                  <span className="block font-bold text-neutral-400">{t.range}</span>
                </th>
              ))}
              <th className="px-4 py-3">NOT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((t) => (
              <tr key={t.slug} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  {t.website ? (
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-bold text-neutral-900 hover:text-volt-dark hover:underline"
                    >
                      {t.operator}
                    </a>
                  ) : (
                    <span className="font-bold text-neutral-900">{t.operator}</span>
                  )}
                </td>
                {TIERS.map((tier) => {
                  const { min, max } = tierPrice(t, tier.key);
                  const isCheapest = min != null && min === cheapest[tier.key];
                  return (
                    <td
                      key={tier.key}
                      className={`whitespace-nowrap px-4 py-3 text-right font-black ${
                        min == null ? "text-neutral-300" : "text-neutral-900"
                      }`}
                    >
                      {formatTariff(min, max)}
                      {isCheapest && (
                        <span className="ml-1.5 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-black text-green-700">
                          EN UCUZ
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-[12px] text-neutral-500">{t.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-500">
            &quot;{q}&quot; için operatör bulunamadı.
          </p>
        )}
      </div>

      <p className="text-[11px] text-neutral-400">
        {rows.length} operatör listeleniyor. Fiyatlar operatörlerin ilan ettiği
        liste tarifeleridir; abonelik, kampanya ve ortak kart (roaming)
        kullanımında değişebilir.
      </p>
    </div>
  );
}
