"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatTL } from "@/lib/utils";
import { IconCheck, IconSparkles } from "@/components/ui/Icons";

type Result = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
  rangeKm: number;
  batteryKwh: number;
  dcChargeKw: number;
  acceleration: number;
  consumption: number;
  segment: string;
  rating: number;
  score: number;
  costs: {
    yearlyEnergyCost: number;
    yearlyMaintenance: number;
    yearlySaving: number;
    fiveYearTotal: number;
    perKmCost: number;
    weeklyCharges: number;
  };
  reasons: string[];
};

export default function AdvisorWizard({ bodyTypes }: { bodyTypes: string[] }) {
  const [form, setForm] = useState({
    budget: 1800000,
    dailyKm: 50,
    longTripPerMonth: 1,
    homeCharging: true,
    bodyType: "farketmez",
    priority: "denge",
  });
  const [results, setResults] = useState<Result[] | null>(null);
  const [assumptions, setAssumptions] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      setAssumptions(data.assumptions?.chargeMixNote ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Öneri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={run}
        className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <IconSparkles className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-black text-neutral-900">
            İhtiyaç Analizi
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="flex items-center justify-between text-[12px] font-bold text-neutral-600">
              BÜTÇE
              <span className="text-evos">{formatTL(form.budget)}</span>
            </span>
            <input
              type="range"
              min={800000}
              max={3500000}
              step={50000}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="accent-evos"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="flex items-center justify-between text-[12px] font-bold text-neutral-600">
              GÜNLÜK KİLOMETRE
              <span className="text-evos">{form.dailyKm} km</span>
            </span>
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={form.dailyKm}
              onChange={(e) => setForm({ ...form, dailyKm: Number(e.target.value) })}
              className="accent-evos"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="flex items-center justify-between text-[12px] font-bold text-neutral-600">
              AYLIK UZUN YOL (600+ KM)
              <span className="text-evos">{form.longTripPerMonth} kez</span>
            </span>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={form.longTripPerMonth}
              onChange={(e) =>
                setForm({ ...form, longTripPerMonth: Number(e.target.value) })
              }
              className="accent-evos"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-neutral-600">KASA TİPİ</span>
            <select
              value={form.bodyType}
              onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
            >
              <option value="farketmez">Farketmez</option>
              {bodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-neutral-600">ÖNCELİĞİNİZ</span>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
            >
              <option value="denge">Dengeli</option>
              <option value="menzil">Menzil</option>
              <option value="fiyat">Fiyat</option>
              <option value="performans">Performans</option>
            </select>
          </label>

          <label className="flex items-center gap-3 self-end rounded-md bg-neutral-50 px-4 py-3">
            <input
              type="checkbox"
              checked={form.homeCharging}
              onChange={(e) =>
                setForm({ ...form, homeCharging: e.target.checked })
              }
              className="h-4 w-4 accent-volt"
            />
            <span className="text-sm font-bold text-neutral-700">
              Evde şarj imkânım var
            </span>
          </label>
        </div>

        {error && <span className="text-xs font-bold text-evos">{error}</span>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "ANALİZ EDİLİYOR..." : "BANA UYGUN ARAÇLARI BUL"}
        </button>
      </form>

      {results && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-200 pb-2">
            <h2 className="text-lg font-black text-neutral-900">
              SİZE ÖZEL {results.length} ÖNERİ
            </h2>
            <span className="text-xs text-neutral-500">{assumptions}</span>
          </div>

          {results.length === 0 && (
            <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
              Kriterlerinize uygun araç bulunamadı. Bütçeyi artırmayı deneyin.
            </p>
          )}

          {results.map((r, i) => (
            <article
              key={r.id}
              className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 lg:flex-row"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:w-[260px]">
                <Image
                  src={r.image}
                  alt={`${r.brand} ${r.model}`}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-indigo-600 px-2 py-1 text-[10px] font-black text-white">
                  #{i + 1} · UYUM %{Math.round(r.score)}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-neutral-900">
                    {r.brand}{" "}
                    <span className="font-bold text-neutral-600">{r.model}</span>
                  </h3>
                  <span className="text-lg font-black text-evos">
                    {formatTL(r.price)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Chip>{r.segment}</Chip>
                  <Chip>{r.rangeKm} km menzil</Chip>
                  <Chip>{r.dcChargeKw} kW DC</Chip>
                  <Chip>{r.consumption} kWh/100km</Chip>
                  <Chip>0-100: {r.acceleration}s</Chip>
                </div>

                <ul className="flex flex-col gap-1 pt-1">
                  {r.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2 text-[13px] text-neutral-700"
                    >
                      <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-volt" />
                      {reason}
                    </li>
                  ))}
                </ul>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric label="Yıllık enerji" value={formatTL(r.costs.yearlyEnergyCost)} />
                  <Metric label="Yıllık tasarruf" value={formatTL(r.costs.yearlySaving)} good />
                  <Metric label="5 yıl toplam" value={formatTL(r.costs.fiveYearTotal, { compact: true })} />
                  <Metric label="Haftalık şarj" value={`${r.costs.weeklyCharges} kez`} />
                </div>

                <Link
                  href={`/araclar/${r.slug}`}
                  className="mt-2 w-fit rounded-md bg-neutral-900 px-4 py-2 text-xs font-black text-white transition hover:bg-neutral-700"
                >
                  ARACI İNCELE
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-[10px] font-bold text-neutral-400">{label}</span>
      <span
        className={`text-[13px] font-black ${good ? "text-volt-dark" : "text-neutral-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
