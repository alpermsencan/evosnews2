"use client";

import { useState, useMemo } from "react";
import { IconBolt, IconSparkles } from "@/components/ui/Icons";
import { formatTL } from "@/lib/utils";

export default function FuelSavingsCalculator() {
  const [annualKm, setAnnualKm] = useState<number>(15000);
  const [iceFuelPer100, setIceFuelPer100] = useState<number>(7.5); // Litre / 100km
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(52.0); // ₺ / Litre
  const [evKwhPer100, setEvKwhPer100] = useState<number>(16.5); // kWh / 100km
  const [homeChargePercent, setHomeChargePercent] = useState<number>(75); // %75 Ev, %25 Hızlı DC

  // 2026 Türkiye Şarj ve Elektrik Tarifeleri (Ortalama)
  const homeTariffKwh = 2.60; // ₺ / kWh (Ev prizi / Monofaze / Trifaze AC)
  const fastDcTariffKwh = 11.44; // ₺ / kWh (DC Hızlı Şarj operatör ortalaması)

  const calc = useMemo(() => {
    // 1. Akaryakıtlı Araç Maliyeti
    const fuelLitersAnnual = (annualKm / 100) * iceFuelPer100;
    const fuelCostAnnual = fuelLitersAnnual * fuelPricePerLiter;

    // 2. Elektrikli Araç Maliyeti
    const evKwhAnnual = (annualKm / 100) * evKwhPer100;
    const blendedTariff =
      (homeChargePercent / 100) * homeTariffKwh +
      ((100 - homeChargePercent) / 100) * fastDcTariffKwh;
    const evCostAnnual = evKwhAnnual * blendedTariff;

    // 3. Tasarruflar
    const netSavingsAnnual = Math.max(0, fuelCostAnnual - evCostAnnual);
    const savingsPercent = Math.round((netSavingsAnnual / fuelCostAnnual) * 100);

    // 5 Yıllık TCO (Bakım avantajı: Elektrikli araçta yağ, buji, triger, debriyaj yoktur ~yılda 12.000 TL ekstra tasarruf)
    const fiveYearMaintenanceBonus = 12000 * 5;
    const fiveYearSavings = netSavingsAnnual * 5 + fiveYearMaintenanceBonus;

    // 4. Çevre Etkisi (Litre benzin başına ~2.31 kg CO2)
    const co2SavedTon = ((fuelLitersAnnual * 2.31) / 1000).toFixed(1);
    const treeEquivalent = Math.round(Number(co2SavedTon) * 45);

    return {
      fuelCostAnnual,
      evCostAnnual,
      netSavingsAnnual,
      savingsPercent,
      fiveYearSavings,
      co2SavedTon,
      treeEquivalent,
      blendedTariff: blendedTariff.toFixed(2),
    };
  }, [annualKm, iceFuelPer100, fuelPricePerLiter, evKwhPer100, homeChargePercent]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition sm:p-7">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <IconBolt className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-black text-neutral-900 sm:text-xl">
              Benzin vs. Elektrik Tasarruf Hesaplayıcı
            </h3>
            <p className="text-xs text-neutral-500">
              Mevcut yakıt harcamanızla elektrikli araca geçişteki net kazancınızı hesaplayın
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 border border-emerald-200">
          2026 Akaryakıt & Tarife Verileri
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol Kontroller (7 Kolon) */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Yıllık Kilometre */}
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
              <span>YILLIK YAPILAN YOL</span>
              <span className="rounded-md bg-[#0B1E3F] px-2.5 py-0.5 font-black text-white">
                {annualKm.toLocaleString("tr-TR")} km / yıl
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={45000}
              step={1000}
              value={annualKm}
              onChange={(e) => setAnnualKm(Number(e.target.value))}
              className="accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] font-semibold text-neutral-400">
              <span>5.000 km</span>
              <span>15.000 km (Ortalama)</span>
              <span>30.000 km</span>
              <span>45.000 km</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Mevcut Benzinli Araç Tüketimi */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase">
                <span>Mevcut Araç Tüketimi</span>
                <span className="text-rose-600 font-black">{iceFuelPer100} lt/100km</span>
              </label>
              <input
                type="range"
                min={4.5}
                max={14.0}
                step={0.5}
                value={iceFuelPer100}
                onChange={(e) => setIceFuelPer100(Number(e.target.value))}
                className="accent-rose-500"
              />
              <span className="text-[10px] text-neutral-400">Benzin veya Dizel yakıt tüketimi</span>
            </div>

            {/* Akaryakıt Litre Fiyatı */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase">
                <span>Yakıt Litre Fiyatı</span>
                <span className="text-neutral-900 font-black">{fuelPricePerLiter} ₺/lt</span>
              </label>
              <input
                type="range"
                min={40}
                max={70}
                step={0.5}
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(Number(e.target.value))}
                className="accent-neutral-700"
              />
              <span className="text-[10px] text-neutral-400">Güncel pompa fiyatı</span>
            </div>
          </div>

          {/* Şarj Alışkanlığı (% Ev vs % DC) */}
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
              <span>ŞARJ ALIŞKANLIĞI KARIŞIMI</span>
              <span className="text-xs font-black text-emerald-700">
                %{homeChargePercent} Evde / %{100 - homeChargePercent} Hızlı DC
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={homeChargePercent}
              onChange={(e) => setHomeChargePercent(Number(e.target.value))}
              className="accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] font-semibold text-neutral-400">
              <span>%100 Dışarıda (DC)</span>
              <span>%50 Karma</span>
              <span className="text-emerald-600 font-bold">%100 Evde (En Ekonomik)</span>
            </div>
          </div>
        </div>

        {/* Sağ Çıktı Kartı (5 Kolon) */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-[#0B1E3F] p-6 text-white shadow-lg lg:col-span-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-widest text-emerald-300 uppercase">
              YILLIK CEPTE KALAN NET TASARRUF
            </span>
            <div className="my-1 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight sm:text-5xl text-white">
                {formatTL(calc.netSavingsAnnual)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-400/30">
                %{calc.savingsPercent} Yakıt İndirimi
              </span>
              <span className="text-xs text-neutral-300">akaryakıta kıyasla</span>
            </div>
          </div>

          {/* Kıyaslama Barları */}
          <div className="my-5 flex flex-col gap-3 border-y border-white/10 py-4">
            {/* Akaryakıt Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold text-neutral-300">
                <span>Benzin / Dizel Masrafı</span>
                <span className="text-rose-300 font-black">{formatTL(calc.fuelCostAnnual)} / yıl</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-rose-500 rounded-full w-full" />
              </div>
            </div>

            {/* Elektrik Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold text-neutral-300">
                <span>Elektrik (Şarj) Masrafı</span>
                <span className="text-emerald-300 font-black">{formatTL(calc.evCostAnnual)} / yıl</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(12, 100 - calc.savingsPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5 Yıllık TCO ve Ağaç Katkısı */}
          <div className="flex flex-col gap-3 rounded-xl bg-white/5 p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold">5 Yıllık Toplam Tasarruf:</span>
              <span className="text-base font-black text-emerald-300">
                {formatTL(calc.fiveYearSavings)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2">
              <span className="text-neutral-300 font-semibold">Karbon Salım Azalması:</span>
              <span className="text-xs font-bold text-teal-300">
                {calc.co2SavedTon} Ton CO₂ (~{calc.treeEquivalent} ağaç)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
