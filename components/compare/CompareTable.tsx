"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompare } from "./CompareProvider";
import { formatTL } from "@/lib/utils";
import VoltScoreBadge from "@/components/listings/VoltScoreBadge";

/**
 * Karşılaştırma tablosu.
 *
 * Sepet tarayıcıda tutulduğu için veriyi sunucudan bu bileşen ister. Satırlar
 * sabit bir şemadadır: sıfır katalog aracı ile ikinci el ilan aynı sütun
 * yapısına indirgenir, böylece "sıfır mı ikinci el mi" karşılaştırması
 * gerçekten yan yana yapılabilir.
 *
 * Bir satırda TÜM araçlar için veri yoksa o satır hiç gösterilmez — boş bir
 * "—" sırası tabloyu uzatmaktan başka işe yaramaz.
 */

type Row = {
  kind: "vehicle" | "listing";
  slug: string;
  title: string;
  href: string;
  image: string;
  price: number;
  year: number | null;
  km: number | null;
  condition: string;
  rangeKm: number | null;
  rangeSummerKm: number | null;
  rangeWinterKm: number | null;
  batteryKwh: number | null;
  dcChargeKw: number | null;
  motorPowerHp: number | null;
  acceleration: number | null;
  consumption: number | null;
  segment: string | null;
  city: string | null;
  batteryHealth: number | null;
  batteryVerified: boolean;
  voltScore: number | null;
};

type Spec = {
  label: string;
  get: (r: Row) => string | null;
  /** Sayısal karşılaştırmada "iyi" olan yön — en iyi değer vurgulanır. */
  best?: "high" | "low";
  value?: (r: Row) => number | null;
};

const SPECS: Spec[] = [
  { label: "Durum", get: (r) => (r.condition === "SIFIR" ? "Sıfır" : "İkinci el") },
  { label: "Model yılı", get: (r) => (r.year ? String(r.year) : null) },
  {
    label: "Kilometre",
    get: (r) => (r.km == null ? null : `${r.km.toLocaleString("tr-TR")} km`),
    best: "low",
    value: (r) => r.km,
  },
  {
    label: "Fiyat",
    get: (r) => formatTL(r.price),
    best: "low",
    value: (r) => r.price,
  },
  {
    label: "Menzil (WLTP)",
    get: (r) => (r.rangeKm ? `${r.rangeKm} km` : null),
    best: "high",
    value: (r) => r.rangeKm,
  },
  {
    label: "Gerçek yaz menzili",
    get: (r) => (r.rangeSummerKm ? `${r.rangeSummerKm} km` : null),
    best: "high",
    value: (r) => r.rangeSummerKm,
  },
  {
    label: "Gerçek kış menzili",
    get: (r) => (r.rangeWinterKm ? `${r.rangeWinterKm} km` : null),
    best: "high",
    value: (r) => r.rangeWinterKm,
  },
  {
    label: "Batarya",
    get: (r) => (r.batteryKwh ? `${r.batteryKwh} kWh` : null),
    best: "high",
    value: (r) => r.batteryKwh,
  },
  {
    label: "Batarya sağlığı",
    get: (r) =>
      r.batteryHealth == null
        ? null
        : `%${r.batteryHealth}${r.batteryVerified ? " (ölçülü)" : r.kind === "listing" ? " (beyan)" : ""}`,
    best: "high",
    value: (r) => r.batteryHealth,
  },
  {
    label: "DC şarj gücü",
    get: (r) => (r.dcChargeKw ? `${r.dcChargeKw} kW` : null),
    best: "high",
    value: (r) => r.dcChargeKw,
  },
  {
    label: "Motor gücü",
    get: (r) => (r.motorPowerHp ? `${r.motorPowerHp} HP` : null),
    best: "high",
    value: (r) => r.motorPowerHp,
  },
  {
    label: "0-100 km/s",
    get: (r) => (r.acceleration ? `${r.acceleration} sn` : null),
    best: "low",
    value: (r) => r.acceleration,
  },
  {
    label: "Tüketim",
    get: (r) => (r.consumption ? `${r.consumption} kWh/100km` : null),
    best: "low",
    value: (r) => r.consumption,
  },
  { label: "Segment", get: (r) => r.segment },
  { label: "Şehir", get: (r) => r.city },
];

export default function CompareTable() {
  const { items, remove, clear, ready } = useCompare();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      setRows([]);
      return;
    }

    const vehicle = items.filter((i) => i.kind === "vehicle").map((i) => i.slug);
    const listing = items.filter((i) => i.kind === "listing").map((i) => i.slug);
    const qs = new URLSearchParams();
    if (vehicle.length) qs.set("vehicle", vehicle.join(","));
    if (listing.length) qs.set("listing", listing.join(","));

    setLoading(true);
    fetch(`/api/compare?${qs}`)
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [items, ready]);

  if (!ready || rows === null) {
    return <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">Yükleniyor…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
        <h2 className="text-base font-black text-neutral-800">Karşılaştırma listeniz boş</h2>
        <p className="max-w-md text-sm text-neutral-500">
          Araç ve ilan kartlarındaki <strong>Karşılaştır</strong> düğmesiyle en
          fazla 4 araç seçin. Seçiminiz sayfalar arasında korunur; sıfır katalog
          modelleriyle ikinci el ilanları aynı tabloda karşılaştırabilirsiniz.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/araclar"
            className="rounded-md bg-evos px-5 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark"
          >
            SIFIR MODELLER
          </Link>
          <Link
            href="/ilanlar"
            className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-black text-neutral-700 transition hover:border-evos hover:text-evos"
          >
            İLANLAR
          </Link>
        </div>
      </div>
    );
  }

  // Sepette olup sunucudan dönmeyen kayıtlar (silinmiş/yayından kalkmış).
  const missing = items.filter(
    (i) => !rows.some((r) => r.kind === i.kind && r.slug === i.slug),
  );

  const visibleSpecs = SPECS.filter((s) => rows.some((r) => s.get(r) != null));

  return (
    <div className="flex flex-col gap-3">
      {missing.length > 0 && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] font-bold text-amber-800">
          {missing.length} kayıt artık yayında değil ve tablodan çıkarıldı.
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-neutral-500">
          {rows.length} araç karşılaştırılıyor {loading && "· yenileniyor…"}
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] font-bold text-neutral-400 transition hover:text-evos"
        >
          LİSTEYİ TEMİZLE
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="w-[150px] px-4 py-3 text-[11px] font-black tracking-wide text-neutral-500">
                ÖZELLİK
              </th>
              {rows.map((r) => (
                <th key={`${r.kind}-${r.slug}`} className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-2">
                    <Link href={r.href} className="relative block h-24 w-full overflow-hidden rounded bg-neutral-100">
                      <Image src={r.image} alt={r.title} fill sizes="200px" className="object-cover" />
                    </Link>
                    <Link
                      href={r.href}
                      className="line-clamp-2 text-[13px] font-black leading-snug text-neutral-900 hover:text-evos"
                    >
                      {r.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      {r.voltScore != null && <VoltScoreBadge score={r.voltScore} />}
                      <button
                        type="button"
                        onClick={() => remove(r.kind, r.slug)}
                        className="text-[10px] font-bold text-neutral-400 hover:text-evos"
                      >
                        ÇIKAR
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleSpecs.map((spec) => {
              // En iyi değeri bul — yalnızca birden fazla veri varsa vurgula.
              const values = rows.map((r) => spec.value?.(r) ?? null);
              const known = values.filter((v): v is number => v != null);
              const bestValue =
                spec.best && known.length > 1
                  ? spec.best === "high"
                    ? Math.max(...known)
                    : Math.min(...known)
                  : null;

              return (
                <tr key={spec.label} className="hover:bg-neutral-50">
                  <th className="px-4 py-3 text-left text-[12px] font-bold text-neutral-500">
                    {spec.label}
                  </th>
                  {rows.map((r, i) => {
                    const text = spec.get(r);
                    const isBest = bestValue != null && values[i] === bestValue;
                    return (
                      <td
                        key={`${r.kind}-${r.slug}`}
                        className={`px-4 py-3 text-[13px] ${
                          isBest ? "font-black text-volt-dark" : "font-semibold text-neutral-800"
                        }`}
                      >
                        {text ?? <span className="text-neutral-300">—</span>}
                        {isBest && <span className="ml-1 text-[10px]">✓</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-neutral-400">
        ✓ işareti o satırdaki en iyi değeri gösterir. &quot;—&quot; verinin
        olmadığı anlamına gelir; doğrulanmamış hiçbir değer tahminle
        doldurulmaz.
      </p>
    </div>
  );
}
