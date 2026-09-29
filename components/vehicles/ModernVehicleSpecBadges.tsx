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
          title: `${vehicle.brand} ${vehicle.model} - EVOtoPilot`,
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
    <div className="flex flex-col gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs justify-between">
      {/* Üst Metadata & Aksiyonlar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-neutral-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Kasa Tipi */}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
            {vehicle.bodyType || "Sedan"}
          </span>

          {/* Model Yılı */}
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
            {vehicle.year}
          </span>

          {/* Ülke */}
          {vehicle.originCountry && (
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
              {vehicle.originCountry}
            </span>
          )}

          {/* Satış Durumu */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isTrYok
                ? "bg-neutral-100 text-neutral-600"
                : isTrYakinda
                ? "bg-neutral-900 text-white"
                : "bg-red-50 text-red-600 border border-red-200/80"
            }`}
          >
            {isTrYok ? "TR'de Yok" : isTrYakinda ? "TR'de Yakında" : "Resmi Satışta"}
          </span>
        </div>

        {/* Aksiyon Butonları: Karşılaştır, Paylaş, Favorile */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Link
            href={`/karsilastir?v1=${vehicle.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-bold text-neutral-700 hover:text-black transition"
            title="Karşılaştır"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <span className="hidden sm:inline">Karşılaştır</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-bold text-neutral-700 hover:text-black transition"
            title="Paylaş"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">{copied ? "Kopyalandı!" : "Paylaş"}</span>
          </button>

          <button
            type="button"
            onClick={() => setFav(!fav)}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold transition ${
              fav
                ? "border-red-600 bg-red-50 text-red-600"
                : "border-neutral-200 text-neutral-700 hover:border-black hover:text-black"
            }`}
            title="Favorilere Ekle"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Teknik Metrik Kartları Grid (Porsche GT / Automotive Spec Stili) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. FİYAT KUTUSU (Obsidian Black Luxury Card) */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#0C0E14] text-white border border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-2 text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              TAVSİYE EDİLEN FİYAT
            </span>
            <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-black tracking-wide">
              %{vehicle.otvRate} ÖTV
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatTL(vehicle.price)}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium mt-1">
              Tahmini matrah {formatTL(otvBase)} · KDV %20
            </div>
          </div>
        </div>

        {/* 2. MENZİL KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              MENZİL (WLTP)
            </span>
            <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-800 font-bold">
              Resmi Test
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-950 tracking-tight">
              {vehicle.rangeKm} <span className="text-base font-bold text-neutral-600">km</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-1">
              Yaz: ~{vehicle.rangeSummerKm || Math.round(vehicle.rangeKm * 0.95)} km · Kış: ~
              {vehicle.rangeWinterKm || Math.round(vehicle.rangeKm * 0.78)} km
            </div>
          </div>
        </div>

        {/* 3. TÜKETİM KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              ORTALAMA TÜKETİM
            </span>
            <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-800 font-bold">
              Karma WLTP
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-950 tracking-tight">
              {vehicle.consumption} <span className="text-sm font-bold text-neutral-600">kWh / 100 km</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-1">
              100 km tahmini şarj maliyeti: ~{Math.round(vehicle.consumption * 4.9)} ₺
            </div>
          </div>
        </div>

        {/* 4. BATARYA KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              BATARYA KAPASİTESİ
            </span>
            <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-800 font-bold">
              Li-ion
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-950 tracking-tight">
              {vehicle.batteryKwh} <span className="text-base font-bold text-neutral-600">kWh</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-1">
              Kullanılabilir net kapasite: ~{vehicle.batteryUsableKwh || Math.round(vehicle.batteryKwh * 0.95)} kWh
            </div>
          </div>
        </div>

        {/* 5. DC HIZLI ŞARJ KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              DC HIZLI ŞARJ
            </span>
            <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-800 font-bold">
              Hızlı Şarj
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-950 tracking-tight">
              {vehicle.dcChargeKw ? `${vehicle.dcChargeKw} kW` : "—"}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-1">
              %10-80 DC Şarj Süresi: {vehicle.chargeMin ? `${vehicle.chargeMin} dakika` : "—"}
            </div>
          </div>
        </div>

        {/* 6. GÜÇ VE HIZLANMA KUTUSU */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-50/90 border border-neutral-200/90 hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              MOTOR &amp; HIZLANMA
            </span>
            <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded text-neutral-800 font-bold">
              {vehicle.driveType}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-950 tracking-tight">
              {vehicle.motorPowerHp} <span className="text-base font-bold text-neutral-600">HP</span>{" "}
              <span className="text-sm font-semibold text-neutral-500">({vehicle.motorPowerKw} kW)</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-medium mt-1">
              0-100 km/s: {vehicle.acceleration} s · Azami: {vehicle.topSpeed} km/s
            </div>
          </div>
        </div>
      </div>

      {/* Alt Aksiyon Butonları (Executive Luxury Styling) */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <Link
          href="/finansman"
          className="flex-1 rounded-xl bg-neutral-950 px-4 py-3 text-center text-xs font-black text-white transition hover:bg-neutral-800 shadow-xs flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>ÖTV &amp; VERGİ HESAPLA</span>
        </Link>
        <Link
          href="/topluluk"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-center text-xs font-black text-neutral-900 transition hover:border-black hover:bg-neutral-50 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>TOPLULUĞA SOR</span>
        </Link>
        <Link
          href="/ilanlar"
          className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center text-xs font-black text-white transition hover:bg-red-700 shadow-xs flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>2. EL İLANLARI</span>
        </Link>
      </div>
    </div>
  );
}
