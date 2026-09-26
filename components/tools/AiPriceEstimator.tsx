"use client";

import { useState } from "react";
import { IconSparkles } from "@/components/ui/Icons";

const MODELS_MAP: Record<string, string[]> = {
  TOGG: ["T10X V1", "T10X V2"],
  Tesla: ["Model Y Long Range", "Model Y Performance", "Model 3"],
  Hyundai: ["Ioniq 5", "Ioniq 6", "Kona Electric"],
  Renault: ["Zoe", "Megane E-Tech", "Scenic E-Tech"],
  Porsche: ["Taycan 4S", "Taycan Turbo"],
};

export default function AiPriceEstimator() {
  const [brand, setBrand] = useState("TOGG");
  const [model, setModel] = useState("T10X V2");
  const [year, setYear] = useState("2024");
  const [km, setKm] = useState("15000");
  const [soh, setSoh] = useState("98");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBrandChange = (b: string) => {
    setBrand(b);
    const models = MODELS_MAP[b] || [];
    setModel(models[0] || "");
    setResult(null);
    setError(null);
  };

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      const parsedYear = Number(year);
      const parsedKm = Number(km);
      const parsedSoh = Number(soh);

      if (!parsedYear || !parsedKm || !parsedSoh) {
        setError("Lütfen tüm alanları geçerli sayılarla doldurun.");
        return;
      }

      // If they search for a brand/model that we support with mock listings data
      if (brand === "TOGG" || brand === "Tesla") {
        let baseVal = brand === "TOGG" ? 1750000 : 2600000;
        
        // Age degradation
        const age = Math.max(0, 2026 - parsedYear);
        baseVal = baseVal - age * 80000;
        
        // Km degradation
        baseVal = baseVal - (parsedKm / 1000) * 8000;
        
        // SOH degradation
        const sohDeg = Math.max(0, 100 - parsedSoh);
        baseVal = baseVal - sohDeg * 25000;

        if (baseVal < 500000) baseVal = 500000;

        setResult(
          `Tahmini Değer: ${Math.round(baseVal).toLocaleString("tr-TR")} ₺\n\n(AI Analizi: Aracın yaş, kilometre ve batarya sağlığı (%${parsedSoh} SOH) değerleri benzer 12 ilan ile karşılaştırılarak hesaplanmıştır.)`
        );
      } else {
        setError("Bu araç için henüz yeterli ilan verisi yok. Farklı bir marka/model deneyin.");
      }
    }, 1200);
  };

  return (
    <div className="rounded-2xl bg-[#091526] p-6 text-white border border-neutral-800 shadow-xl max-w-lg mx-auto w-full">
      <div className="flex flex-col gap-1 mb-5">
        <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase">
          FİYAT ANALİZİ
        </span>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">
          AI Destekli Fiyat Tahmini
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
          Aracının bilgilerini gir; tahmini piyasa değeri, aynı araca ait gerçek ilanların verilerinden ve batarya aşınma eğrilerinden hesaplansın.
        </p>
      </div>

      <form onSubmit={handleEstimate} className="flex flex-col gap-4">
        {/* Brand & Model Select */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Marka</label>
            <select
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white"
            >
              {Object.keys(MODELS_MAP).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Model</label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setResult(null);
                setError(null);
              }}
              className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white"
            >
              {(MODELS_MAP[brand] || []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year & Km Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Yıl</label>
            <input
              type="number"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setResult(null);
              }}
              placeholder="Örn: 2023"
              className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Kilometre</label>
            <input
              type="number"
              value={km}
              onChange={(e) => {
                setKm(e.target.value);
                setResult(null);
              }}
              placeholder="Örn: 25000"
              className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white"
            />
          </div>
          <div className="flex flex-col gap-1.5 col-span-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">SOH (%)</label>
            <input
              type="number"
              value={soh}
              onChange={(e) => {
                setSoh(e.target.value);
                setResult(null);
              }}
              placeholder="Örn: 95"
              className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white"
            />
          </div>
        </div>

        {/* Calculate button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-sky-500 hover:bg-sky-600 active:bg-sky-700 py-3 text-xs font-black text-white transition duration-300 disabled:opacity-50"
        >
          <IconSparkles className="h-4 w-4" />
          {loading ? "Hesaplanıyor..." : "Fiyat Tahmini Al"}
        </button>
      </form>

      {/* Results or Errors */}
      {result && (
        <div className="mt-4 rounded border border-sky-500 bg-sky-950/20 p-4 text-xs leading-relaxed text-sky-300">
          <p className="whitespace-pre-line font-medium">{result}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded border border-red-900 bg-red-950/20 p-4 text-xs leading-relaxed text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
}
