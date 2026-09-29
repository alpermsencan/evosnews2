"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconBolt, IconBattery } from "@/components/ui/Icons";

export default function EvotopilotChargingAssistant() {
  const [mode, setMode] = useState<"trip" | "battery">("trip");

  // Kart 1: Yolculuk Şarj Maliyeti
  const [consumption, setConsumption] = useState<number>(18); // kWh / 100 km
  const [price1, setPrice1] = useState<number>(9.9); // TL / kWh
  const [distance, setDistance] = useState<number>(250); // km

  // Kart 2: Batarya Dolum Maliyeti
  const [capacity, setCapacity] = useState<number>(60); // kWh
  const [price2, setPrice2] = useState<number>(9.9); // TL / kWh
  const [chargePercent, setChargePercent] = useState<number>(80); // %

  // Hesaplamalar
  const tripCost = ((consumption / 100) * distance * price1).toFixed(2);
  const costPerKm = ((consumption / 100) * price1).toFixed(2);

  const batteryAddedKwh = (capacity * (chargePercent / 100)).toFixed(1);
  const batteryCost = (capacity * (chargePercent / 100) * price2).toFixed(2);

  // Hızlı Fiyat Ön Tanımları
  const TARIFF_PRESETS = [
    { label: "Ev Elektriği", price: 2.6 },
    { label: "AC Şarj", price: 6.5 },
    { label: "DC Hızlı", price: 9.9 },
    { label: "Ultra DC", price: 12.9 },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800/10 bg-white shadow-sm ring-1 ring-black/5">
      {/* 1. ÜST BAŞLIK (Executive Obsidian & Neon Electric Styling) */}
      <div className="relative bg-gradient-to-r from-neutral-950 via-slate-900 to-black px-4 py-3.5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40">
              <IconBolt className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black tracking-wider text-white uppercase">
                  EVOTOPİLOT ŞARJ ASİSTANI
                </h3>
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping" />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">
                Yolculuk &amp; Batarya Dolum Maliyeti Hesaplama
              </p>
            </div>
          </div>
          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-yellow-400 border border-yellow-500/30">
            ANLIK HESAP
          </span>
        </div>

        {/* Mod Değiştirici Sekmeler */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-neutral-900/90 p-1 border border-neutral-800">
          <button
            type="button"
            onClick={() => setMode("trip")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-black transition ${
              mode === "trip"
                ? "bg-yellow-400 text-neutral-950 shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <IconBolt className="h-3.5 w-3.5" />
            <span>Yolculuk Şarjı</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("battery")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-black transition ${
              mode === "battery"
                ? "bg-yellow-400 text-neutral-950 shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <IconBattery className="h-3.5 w-3.5" />
            <span>Batarya Dolumu</span>
          </button>
        </div>
      </div>

      {/* 2. FORM ALANLARI */}
      <div className="p-4 flex flex-col gap-4">
        {mode === "trip" ? (
          /* MOD 1: YOLCULUK ŞARJ MALİYETİ */
          <div className="flex flex-col gap-3.5">
            {/* Tüketim */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Tüketim (100 km)</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  {consumption} kWh
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="0.5"
                value={consumption}
                onChange={(e) => setConsumption(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                <span>10 kWh (Şehir İçi)</span>
                <span>25 kWh</span>
                <span>40 kWh (Yüksek Hız)</span>
              </div>
            </div>

            {/* Fiyat (1 kWh) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Birim Fiyat (1 kWh)</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  {price1.toFixed(1)} ₺
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.1"
                value={price1}
                onChange={(e) => setPrice1(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              {/* Hızlı Tarife Butonları */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {TARIFF_PRESETS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setPrice1(t.price)}
                    className={`py-1 text-[10px] font-bold rounded border transition ${
                      Math.abs(price1 - t.price) < 0.1
                        ? "bg-neutral-950 text-white border-neutral-950 font-black"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesafe */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Mesafe</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  {distance} km
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                <span>50 km</span>
                <span>250 km</span>
                <span>500 km</span>
                <span>1000 km</span>
              </div>
            </div>

            {/* Sonuç Kutusu */}
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-neutral-950 via-slate-900 to-black p-3.5 text-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 block">
                    Tahmini Şarj Maliyeti
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Km başı: <strong className="text-white font-bold">{costPerKm} ₺ / km</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-yellow-400 tracking-tight block">
                    {tripCost} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MOD 2: BATARYA DOLUM MALİYETİ */
          <div className="flex flex-col gap-3.5">
            {/* Batarya Kapasitesi */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Batarya Kapasitesi</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  {capacity} kWh
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                <span>20 kWh</span>
                <span>60 kWh (Ortalama)</span>
                <span>100 kWh+</span>
              </div>
            </div>

            {/* Fiyat (1 kWh) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Birim Fiyat (1 kWh)</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  {price2.toFixed(1)} ₺
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.1"
                value={price2}
                onChange={(e) => setPrice2(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              {/* Hızlı Tarife Butonları */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {TARIFF_PRESETS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setPrice2(t.price)}
                    className={`py-1 text-[10px] font-bold rounded border transition ${
                      Math.abs(price2 - t.price) < 0.1
                        ? "bg-neutral-950 text-white border-neutral-950 font-black"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eklenecek Şarj Yüzdesi */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Eklenecek Şarj Oranı</span>
                <span className="font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                  %{chargePercent} ({batteryAddedKwh} kWh)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={chargePercent}
                onChange={(e) => setChargePercent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                <span>%20 (Takviye)</span>
                <span>%80 (Önerilen)</span>
                <span>%100 (Tam Dolum)</span>
              </div>
            </div>

            {/* Sonuç Kutusu */}
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-neutral-950 via-slate-900 to-black p-3.5 text-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 block">
                    Dolum Tutarı
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Eklenen Enerji: <strong className="text-white font-bold">{batteryAddedKwh} kWh</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-yellow-400 tracking-tight block">
                    {batteryCost} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dipnot & Şarj Tarifeleri Linki */}
        <p className="text-[11px] leading-relaxed text-neutral-500 border-t border-neutral-100 pt-2.5">
          Örnek birim fiyatla tahmini hesaplamadır; şarj kayıpları operatöre göre değişebilir.{" "}
          <Link href="/sarj-agi" className="font-black text-neutral-900 hover:text-red-600 underline">
            Operatör tarifelerini karşılaştırın →
          </Link>
        </p>
      </div>
    </div>
  );
}
