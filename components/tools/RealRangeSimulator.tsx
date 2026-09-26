"use client";

import { useState, useMemo } from "react";
import { IconBolt, IconSparkles } from "@/components/ui/Icons";

export type VehiclePreset = {
  name: string;
  wltpRange: number;
  batteryKwh: number;
  hasHeatPump: boolean;
};

const PRESETS: VehiclePreset[] = [
  { name: "Togg T10F Fastback (2026)", wltpRange: 600, batteryKwh: 88.5, hasHeatPump: true },
  { name: "Togg T10X V2 Uzun Menzil", wltpRange: 523, batteryKwh: 88.5, hasHeatPump: true },
  { name: "Tesla Model Y 2026 'Juniper'", wltpRange: 565, batteryKwh: 78.1, hasHeatPump: true },
  { name: "BYD Seal Excellence AWD", wltpRange: 570, batteryKwh: 82.5, hasHeatPump: true },
  { name: "Renault 5 E-Tech (2026)", wltpRange: 400, batteryKwh: 52.0, hasHeatPump: false },
  { name: "Hyundai Ioniq 5 Facelift", wltpRange: 570, batteryKwh: 84.0, hasHeatPump: true },
  { name: "Kia EV3 Long Range (2026)", wltpRange: 600, batteryKwh: 81.4, hasHeatPump: true },
  { name: "Porsche Taycan 4S", wltpRange: 642, batteryKwh: 93.4, hasHeatPump: true },
];

export default function RealRangeSimulator({
  defaultWltp = 523,
  defaultBattery = 88.5,
  defaultModelName,
}: {
  defaultWltp?: number;
  defaultBattery?: number;
  defaultModelName?: string;
}) {
  const [selectedPreset, setSelectedPreset] = useState<string>(
    defaultModelName || PRESETS[0].name
  );
  const [customWltp, setCustomWltp] = useState<number>(defaultWltp);
  const [temp, setTemp] = useState<number>(5); // -10 to 35 °C
  const [speedProfile, setSpeedProfile] = useState<"city" | "mixed" | "highway">("highway");
  const [climateMode, setClimateMode] = useState<"off" | "heat_pump" | "standard_ac">("heat_pump");
  const [load, setLoad] = useState<"single" | "full">("single");

  // Aktif temel menzil
  const baseRange = useMemo(() => {
    const found = PRESETS.find((p) => p.name === selectedPreset);
    return found ? found.wltpRange : customWltp;
  }, [selectedPreset, customWltp]);

  const baseBattery = useMemo(() => {
    const found = PRESETS.find((p) => p.name === selectedPreset);
    return found ? found.batteryKwh : defaultBattery;
  }, [selectedPreset, defaultBattery]);

  // Gerçek menzil hesaplama algoritması
  const calculation = useMemo(() => {
    let factor = 1.0;

    // 1. Sıcaklık Etkisi
    if (temp <= -10) factor *= 0.76;
    else if (temp <= 0) factor *= 0.83;
    else if (temp <= 10) factor *= 0.91;
    else if (temp <= 22) factor *= 1.0; // İdeal batarya çalışma aralığı
    else if (temp <= 30) factor *= 0.96;
    else factor *= 0.90; // Aşırı sıcak klima ve batarya soğutma yükü

    // 2. Sürüş Profili ve Hız
    if (speedProfile === "city") {
      factor *= 1.08;
    } else if (speedProfile === "mixed") {
      factor *= 0.95;
    } else if (speedProfile === "highway") {
      factor *= 0.74;
    }

    // 3. Klima / Isıtma Durumu
    if (climateMode === "heat_pump") {
      if (temp < 15 || temp > 25) factor *= 0.94;
    } else if (climateMode === "standard_ac") {
      if (temp < 15) factor *= 0.86;
      else if (temp > 25) factor *= 0.91;
    }

    // 4. Yük / Yolcu
    if (load === "full") {
      factor *= 0.95;
    }

    const estimatedKm = Math.round(baseRange * factor);
    const diffPercent = Math.round(((estimatedKm - baseRange) / baseRange) * 100);
    const estConsumption = ((baseBattery / estimatedKm) * 100).toFixed(1);

    return {
      estimatedKm,
      diffPercent,
      estConsumption,
      factor,
    };
  }, [baseRange, baseBattery, temp, speedProfile, climateMode, load]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition sm:p-7">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E3F] text-sky-400">
            <IconBolt className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-black text-neutral-900 sm:text-xl">
              Gerçek Menzil Simülatörü
            </h3>
            <p className="text-xs text-neutral-500">
              Hava sıcaklığı, otoban hızı ve klimanın menzile etkisini canlı test edin
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700 border border-sky-200">
          2026 Dinamik Algoritma
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol Kontroller */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Araç Seçimi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-black text-neutral-700 uppercase tracking-wide">
              Test Edilecek Model
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-800 outline-none transition focus:border-sky-500 focus:bg-white"
            >
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} (WLTP: {p.wltpRange} km · {p.batteryKwh} kWh)
                </option>
              ))}
              <option value="custom">Özel Araç (Kendi değerimi gireceğim)</option>
            </select>
          </div>

          {selectedPreset === "custom" && (
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center justify-between text-[12px] font-bold text-neutral-600">
                <span>Fabrika WLTP Menzili</span>
                <span className="font-black text-sky-600">{customWltp} km</span>
              </label>
              <input
                type="range"
                min={200}
                max={900}
                step={10}
                value={customWltp}
                onChange={(e) => setCustomWltp(Number(e.target.value))}
                className="accent-sky-600"
              />
            </div>
          )}

          {/* Dış Hava Sıcaklığı Slider */}
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
              <span>DIŞ HAVA SICAKLIĞI</span>
              <span
                className={`rounded-md px-2 py-0.5 font-black text-white ${
                  temp < 0
                    ? "bg-blue-600"
                    : temp < 15
                    ? "bg-sky-500"
                    : temp <= 25
                    ? "bg-emerald-500"
                    : "bg-amber-600"
                }`}
              >
                {temp > 0 ? `+${temp}` : temp} °C
              </span>
            </div>
            <input
              type="range"
              min={-15}
              max={40}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="accent-sky-600"
            />
            <div className="flex justify-between text-[10px] font-semibold text-neutral-400">
              <span>-15°C (Kış / Kar)</span>
              <span>10°C (Serin)</span>
              <span className="text-emerald-600 font-bold">20°C (İdeal)</span>
              <span>40°C (Kavurucu)</span>
            </div>
          </div>

          {/* Sürüş Profili */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-neutral-700 uppercase tracking-wide">
              Sürüş Profili & Hız
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSpeedProfile("city")}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  speedProfile === "city"
                    ? "border-sky-500 bg-sky-50 text-sky-900 font-black shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-bold"
                }`}
              >
                <span className="text-xs">Şehir İçi</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">50 km/s · ReGen</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeedProfile("mixed")}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  speedProfile === "mixed"
                    ? "border-sky-500 bg-sky-50 text-sky-900 font-black shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-bold"
                }`}
              >
                <span className="text-xs">Karma</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">90 km/s · Çevre yolu</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeedProfile("highway")}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                  speedProfile === "highway"
                    ? "border-sky-500 bg-sky-50 text-sky-900 font-black shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-bold"
                }`}
              >
                <span className="text-xs">Otoyol</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">130 km/s · Rüzgar</span>
              </button>
            </div>
          </div>

          {/* İklimlendirme & Yük */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase">
                Klima & Isıtma
              </label>
              <select
                value={climateMode}
                onChange={(e) => setClimateMode(e.target.value as any)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 outline-none focus:border-sky-500"
              >
                <option value="heat_pump">Açık (Isı Pompalı Sistem)</option>
                <option value="standard_ac">Açık (Standart Rezistans/AC)</option>
                <option value="off">Kapalı (Klima Kullanılmıyor)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase">
                Araç Yükü
              </label>
              <select
                value={load}
                onChange={(e) => setLoad(e.target.value as any)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 outline-none focus:border-sky-500"
              >
                <option value="single">Yalnızca Sürücü (1 Kişi)</option>
                <option value="full">Dolu Araç (4 Kişi + Bagaj)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sağ Çıktı Kartı */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0B1E3F] via-[#102A56] to-[#0A1830] p-6 text-white shadow-lg lg:col-span-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-sky-400 uppercase">
                TAHMİNİ GERÇEK MENZİL
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-neutral-300">
                Fabrika: {baseRange} km
              </span>
            </div>

            <div className="my-2 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight sm:text-5xl text-white">
                {calculation.estimatedKm}
              </span>
              <span className="text-lg font-bold text-sky-400">km</span>
            </div>

            {/* WLTP Sapma Rozeti */}
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                  calculation.diffPercent < 0
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {calculation.diffPercent > 0 ? `+${calculation.diffPercent}%` : `${calculation.diffPercent}%`}
                {calculation.diffPercent < 0 ? " Kayıp" : " Verim"}
              </span>
              <span className="text-xs text-neutral-300 font-medium">WLTP normuna göre</span>
            </div>
          </div>

          {/* Detay Metrikler */}
          <div className="my-4 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase">
                Tahmini Tüketim
              </span>
              <span className="text-base font-black text-sky-300">
                {calculation.estConsumption} <span className="text-xs font-bold text-neutral-400">kWh/100km</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase">
                Batarya Kapasitesi
              </span>
              <span className="text-base font-black text-white">
                {baseBattery} <span className="text-xs font-bold text-neutral-400">kWh</span>
              </span>
            </div>
          </div>

          {/* Rota ve İpucu Tavsiyesi */}
          <div className="rounded-xl bg-white/5 p-3.5 border border-white/10 flex items-start gap-2.5">
            <IconSparkles className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-neutral-300">
              {temp <= 0
                ? "Dondurucu havada batarya kimyası yavaşlar ve kabin ısıtması tüketimi artırır. Yola çıkmadan önce araç şarjdayken kabin ön ısıtması yaparak %10 menzil kazanabilirsiniz."
                : speedProfile === "highway"
                ? "130 km/s yerine 110 km/s hız sabitleyiciyle seyahat etmek aerodinamik direnci düşürerek menzilinizi yaklaşık 45-60 km uzatır."
                : "Şehir içi düşük hızlarda yüksek ReGen (tek pedal sürüşü) sayesinde fabrika WLTP menzilinin dahi üzerine çıkabilirsiniz."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
