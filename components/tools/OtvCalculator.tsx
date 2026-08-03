"use client";

import { useState } from "react";
import { formatTL } from "@/lib/utils";

type Result = {
  base: number;
  rate: number;
  otv: number;
  kdv: number;
  total: number;
};

export default function OtvCalculator({
  vehicles,
}: {
  vehicles: { slug: string; brand: string; model: string; price: number; motorPowerKw: number }[];
}) {
  const [basePrice, setBasePrice] = useState("1200000");
  const [motorKw, setMotorKw] = useState("150");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/otv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: Number(basePrice),
          motorKw: Number(motorKw),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hesaplanamadı");
    } finally {
      setLoading(false);
    }
  };

  const pickVehicle = (slug: string) => {
    const v = vehicles.find((x) => x.slug === slug);
    if (!v) return;
    // Etiket fiyatından yaklaşık matrahı geri hesapla (%20 KDV + ÖTV)
    setMotorKw(String(v.motorPowerKw));
    const guessRate = v.motorPowerKw <= 160 ? (v.price > 2_400_000 ? 40 : 10) : 50;
    setBasePrice(String(Math.round(v.price / (1.2 * (1 + guessRate / 100)))));
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <form
        onSubmit={calc}
        className="flex w-full flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 lg:w-[45%]"
      >
        <h3 className="text-base font-black text-neutral-900">
          ÖTV & KDV HESAPLAYICI
        </h3>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-neutral-500">
            HAZIR ARAÇ SEÇ (opsiyonel)
          </span>
          <select
            onChange={(e) => pickVehicle(e.target.value)}
            defaultValue=""
            className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
          >
            <option value="">Manuel giriş</option>
            {vehicles.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-neutral-500">
            ÖTV MATRAHI (₺)
          </span>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-neutral-500">
            MOTOR GÜCÜ (kW)
          </span>
          <input
            type="number"
            value={motorKw}
            onChange={(e) => setMotorKw(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
          />
        </label>

        {error && <span className="text-xs font-bold text-evos">{error}</span>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "HESAPLANIYOR..." : "HESAPLA"}
        </button>
      </form>

      <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
        <h3 className="text-base font-black text-neutral-900">SONUÇ</h3>

        {!result ? (
          <p className="rounded-md bg-neutral-50 p-6 text-center text-sm text-neutral-500">
            Matrah ve motor gücünü girip hesapla butonuna basın.
          </p>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-neutral-100">
              <ResRow label="ÖTV matrahı" value={formatTL(result.base)} />
              <ResRow label={`ÖTV (%${result.rate})`} value={formatTL(result.otv)} />
              <ResRow label="KDV (%20)" value={formatTL(result.kdv)} />
              <ResRow label="ETİKET FİYATI" value={formatTL(result.total)} big />
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-neutral-500">
                VERGİ DAĞILIMI
              </span>
              <div className="flex h-6 w-full overflow-hidden rounded-md">
                <div
                  className="flex items-center justify-center bg-neutral-700 text-[10px] font-black text-white"
                  style={{ width: `${(result.base / result.total) * 100}%` }}
                >
                  ARAÇ
                </div>
                <div
                  className="flex items-center justify-center bg-violet-600 text-[10px] font-black text-white"
                  style={{ width: `${(result.otv / result.total) * 100}%` }}
                >
                  ÖTV
                </div>
                <div
                  className="flex items-center justify-center bg-evos text-[10px] font-black text-white"
                  style={{ width: `${(result.kdv / result.total) * 100}%` }}
                >
                  KDV
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                Toplam vergi yükü:{" "}
                <strong className="text-neutral-800">
                  {formatTL(result.otv + result.kdv)}
                </strong>{" "}
                (etiket fiyatının %
                {Math.round(((result.otv + result.kdv) / result.total) * 100)})
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResRow({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span
        className={`font-semibold ${big ? "text-sm text-neutral-800" : "text-[12px] text-neutral-500"}`}
      >
        {label}
      </span>
      <span
        className={`font-black ${big ? "text-xl text-evos" : "text-[13px] text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
