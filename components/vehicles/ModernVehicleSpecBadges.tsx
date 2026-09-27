"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatTL } from "@/lib/utils";

type VehicleData = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  year: number;
  segment: string;
  bodyType: string;
  originCountry?: string | null;
  marketStatus: string;
  price: number;
  otvRate: number;
  rangeKm: number;
  rangeSummerKm?: number | null;
  rangeWinterKm?: number | null;
  batteryKwh: number;
  batteryUsableKwh?: number | null;
  motorPowerKw: number;
  motorPowerHp: number;
  acceleration: number;
  topSpeed: number;
  consumption: number;
  driveType: string;
  dcChargeKw?: number | null;
  chargeMin?: number | null;
};

export default function ModernVehicleSpecBadges({
  vehicle,
  otvBase,
}: {
  vehicle: VehicleData;
  otvBase: number;
}) {
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.brand} ${vehicle.model} - EVOS`,
          url: window.location.href,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isTrYok = vehicle.marketStatus === "TR_YOK";
  const isTrYakinda = vehicle.marketStatus === "TR_YAKINDA";

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm justify-between">
      {/* Üst Metadata Hapları & Aksiyonlar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-neutral-150">
        <div className="flex flex-wrap items-center gap-2">
          {/* Kasa Tipi */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
            <span>🚗</span> {vehicle.bodyType || "Sedan"}
          </span>

          {/* Model Yılı */}
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
            {vehicle.year}
          </span>

          {/* Ülke */}
          {vehicle.originCountry && (
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
              🌍 {vehicle.originCountry}
            </span>
          )}

          {/* Satış Durumu */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isTrYok
                ? "bg-amber-100 text-amber-800"
                : isTrYakinda
                ? "bg-blue-100 text-blue-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isTrYok ? "TR'de Yok" : isTrYakinda ? "TR'de Yakında" : "Satışta"}
          </span>
        </div>

        {/* Aksiyon Butonları: Karşılaştır, Paylaş, Favorile */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Link
            href={`/karsilastirma/araba?v1=${vehicle.slug}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 text-xs font-bold text-neutral-700 transition"
            title="Karşılaştır"
          >
            <span>⚖</span>
            <span className="hidden sm:inline">Karşılaştır</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 text-xs font-bold text-neutral-700 transition"
            title="Paylaş"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">{copied ? "Kopyalandı!" : "Paylaş"}</span>
          </button>

          <button
            type="button"
            onClick={() => setFav(!fav)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
              fav
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-900"
            }`}
            title="Favorilere Ekle"
          >
            <span>{fav ? "♥" : "♡"}</span>
          </button>
        </div>
      </div>

      {/* Renkli Metrik Rozetleri Grid (DoluBatarya Mercedes EQS Stili) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Turuncu: FİYAT KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 hover:bg-orange-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-orange-800 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🏷️</span> FİYAT
            </span>
            <span className="text-[10px] bg-orange-200/60 px-2 py-0.5 rounded text-orange-900 font-bold">
              %{vehicle.otvRate} ÖTV
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-950 tracking-tight">
              {formatTL(vehicle.price)}
            </div>
            <div className="text-[11px] text-orange-800/80 font-semibold mt-1">
              Tahmini matrah {formatTL(otvBase)} · KDV %20
            </div>
          </div>
        </div>

        {/* 2. Mor: MENZİL KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:bg-purple-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-purple-800 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🛣️</span> MENZİL (WLTP)
            </span>
            <span className="text-[10px] bg-purple-200/60 px-2 py-0.5 rounded text-purple-900 font-bold">
              Resmi
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-950 tracking-tight">
              {vehicle.rangeKm} <span className="text-base font-bold">km</span>
            </div>
            <div className="text-[11px] text-purple-800/80 font-semibold mt-1">
              Yaz: ~{vehicle.rangeSummerKm || Math.round(vehicle.rangeKm * 0.95)} km · Kış: ~
              {vehicle.rangeWinterKm || Math.round(vehicle.rangeKm * 0.78)} km
            </div>
          </div>
        </div>

        {/* 3. Bordo: TÜKETİM KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 hover:bg-rose-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-rose-800 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">⚡</span> ORTALAMA TÜKETİM
            </span>
            <span className="text-[10px] bg-rose-200/60 px-2 py-0.5 rounded text-rose-900 font-bold">
              Karma
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-950 tracking-tight">
              {vehicle.consumption} <span className="text-sm font-bold">kWh / 100 km</span>
            </div>
            <div className="text-[11px] text-rose-800/80 font-semibold mt-1">
              100 km tahmini şarj maliyeti: ~{Math.round(vehicle.consumption * 4.9)} ₺
            </div>
          </div>
        </div>

        {/* 4. Yeşil: BATARYA KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🔋</span> BATARYA KAPASİTESİ
            </span>
            <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 font-bold">
              Li-ion
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-950 tracking-tight">
              {vehicle.batteryKwh} <span className="text-base font-bold">kWh</span>
            </div>
            <div className="text-[11px] text-emerald-800/80 font-semibold mt-1">
              Kullanılabilir net kapasite: ~{vehicle.batteryUsableKwh || Math.round(vehicle.batteryKwh * 0.95)} kWh
            </div>
          </div>
        </div>

        {/* 5. Turkuaz: DC HIZLI ŞARJ KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-cyan-50/70 border border-cyan-200/80 hover:bg-cyan-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-cyan-800 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🔌</span> DC HIZLI ŞARJ
            </span>
            <span className="text-[10px] bg-cyan-200/60 px-2 py-0.5 rounded text-cyan-900 font-bold">
              Hızlı Şarj
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-950 tracking-tight">
              {vehicle.dcChargeKw ? `${vehicle.dcChargeKw} kW` : "—"}
            </div>
            <div className="text-[11px] text-cyan-800/80 font-semibold mt-1">
              %10-80 DC Şarj Süresi: {vehicle.chargeMin ? `${vehicle.chargeMin} dakika` : "—"}
            </div>
          </div>
        </div>

        {/* 6. Açık Yeşil: GÜÇ VE HIZLANMA KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-lime-50/70 border border-lime-200/80 hover:bg-lime-50 transition">
          <div className="flex items-center justify-between text-xs font-black text-lime-900 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🏎️</span> MOTOR &amp; HIZLANMA
            </span>
            <span className="text-[10px] bg-lime-200/60 px-2 py-0.5 rounded text-lime-950 font-bold">
              {vehicle.driveType}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-lime-950 tracking-tight">
              {vehicle.motorPowerHp} <span className="text-base font-bold">HP</span>{" "}
              <span className="text-sm font-semibold text-lime-800">({vehicle.motorPowerKw} kW)</span>
            </div>
            <div className="text-[11px] text-lime-900/85 font-semibold mt-1">
              0-100 km/s: {vehicle.acceleration} s · Azami: {vehicle.topSpeed} km/s
            </div>
          </div>
        </div>
      </div>

      {/* Alt Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <Link
          href="/otv-rehberi"
          className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-center text-xs font-black text-white transition hover:bg-neutral-800 shadow-xs flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>ÖTV &amp; VERGİ HESAPLA</span>
        </Link>
        <Link
          href="/ai-danisman"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-center text-xs font-black text-neutral-800 transition hover:border-neutral-900 hover:bg-neutral-50 flex items-center justify-center gap-2"
        >
          <span>🤖</span>
          <span>AI DANIŞMANA SOR</span>
        </Link>
        <Link
          href="/ilanlar"
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-center text-xs font-black text-white transition hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-2"
        >
          <span>🔍</span>
          <span>2. EL İLANLARI</span>
        </Link>
      </div>
    </div>
  );
}
