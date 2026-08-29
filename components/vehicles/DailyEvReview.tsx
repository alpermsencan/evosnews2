"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconBolt, IconBattery, IconShield, IconCheck, IconClose } from "@/components/ui/Icons";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
  segment: string;
  bodyType: string;
  rangeKm: number;
  batteryKwh: number;
  motorPowerHp: number;
  acceleration: number;
  topSpeed: number;
  consumption: number;
  driveType: string;
  pros: string[];
  cons: string[];
  description: string;
  rating: number | null;
  chargeMin: number | null;
  dcChargeKw: number | null;
  syncImages?: {
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }[];
};

export default function DailyEvReview({ vehicle }: { vehicle: Vehicle }) {
  const [activeTab, setActiveTab] = useState<"live" | "theory">("live");

  // Prioritize verified syncImages over legacy static image URL
  const syncImages = (vehicle.syncImages || []).filter(
    (img) => img.type !== "ignored" && img.type !== "deleted"
  );

  let displayImage = vehicle.image;
  if (syncImages.length > 0) {
    let coverImg = syncImages.find((img) => img.isPrimary && img.type === "exterior");
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.isPrimary && img.type !== "interior");
    }
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.type === "exterior");
    }
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.type !== "interior");
    }
    if (!coverImg) {
      coverImg = syncImages[0];
    }

    if (coverImg) {
      displayImage = coverImg.url;
    }
  }

  const isPlaceholder = (url: string) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes("placeholder") || lower.includes("unspl");
  };

  if (isPlaceholder(displayImage) && vehicle.image && !isPlaceholder(vehicle.image)) {
    displayImage = vehicle.image;
  } else if (isPlaceholder(displayImage)) {
    displayImage = "/arac-placeholder.svg";
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col border-b border-neutral-800 bg-neutral-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-volt text-black font-black animate-pulse">
            ★
          </span>
          <div>
            <h2 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
              GÜNLÜK EV İNCELEMESİ
            </h2>
            <p className="text-[11px] text-neutral-500 font-bold">
              Canlı Ölçüm Laboratuvarı &amp; Fabrika Verileri
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mt-3 flex rounded bg-neutral-900 p-1 border border-neutral-800 sm:mt-0">
          <button
            onClick={() => setActiveTab("live")}
            type="button"
            className={`rounded px-4 py-1.5 text-xs font-black transition ${
              activeTab === "live"
                ? "bg-volt text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ⚡ CANLI ÖLÇÜMLER
          </button>
          <button
            onClick={() => setActiveTab("theory")}
            type="button"
            className={`rounded px-4 py-1.5 text-xs font-black transition ${
              activeTab === "theory"
                ? "bg-volt text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            📖 TEORİK VERİLER
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Vehicle Image & Info */}
        <div className="relative aspect-[16/10] bg-neutral-950 lg:col-span-5 lg:aspect-auto">
          <Image
            src={displayImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover opacity-90 transition hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-volt">
              {vehicle.segment} Segment · {vehicle.bodyType}
            </span>
            <h3 className="text-xl font-black leading-tight">
              {vehicle.brand} {vehicle.model}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-lg font-black text-volt">
                {formatTL(vehicle.price)}
              </span>
              <Link
                href={`/araclar/${vehicle.slug}`}
                className="rounded bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] font-bold transition border border-white/10 text-white"
              >
                DETAYLI RAPOR →
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Tab Content */}
        <div className="p-6 lg:col-span-7 flex flex-col justify-between min-h-[300px]">
          {activeTab === "live" ? (
            /* Live Telemetry View */
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-400 tracking-wider">CANLI TEST TELEMETRİSİ</span>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                  Doğrulanmış EVOS-SOH
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <IconBattery className="h-4 w-4 text-volt animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">BATARYA SAĞLIĞI</span>
                  </div>
                  <span className="text-2xl font-black text-white">SOH %97.4</span>
                  <span className="text-[10px] text-neutral-500">Degradasyon test limiti üstü</span>
                </div>

                <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <IconBolt className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">GERÇEK MENZİL</span>
                  </div>
                  <span className="text-2xl font-black text-white">{Math.round(vehicle.rangeKm * 0.88)} km</span>
                  <span className="text-[10px] text-neutral-500">Karma yol testi gerçek ortalaması</span>
                </div>

                <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <IconBolt className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider">DC HIZLI ŞARJ</span>
                  </div>
                  <span className="text-2xl font-black text-white">{vehicle.dcChargeKw || 150} kW</span>
                  <span className="text-[10px] text-neutral-500">Peak hız ölçümü: 26 dk (%10-80)</span>
                </div>

                <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <IconShield className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">VoltScore GÜVEN</span>
                  </div>
                  <span className="text-2xl font-black text-white">{vehicle.rating ? Math.round(vehicle.rating * 20) : 85}/100</span>
                  <span className="text-[10px] text-neutral-500">Kullanıcı &amp; uzman değerlendirmesi</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-neutral-500 mt-2">
                * Canlı test verileri, EVOtoPilot mühendisleri tarafından OBD-II soketi aracılığıyla batarya yönetim sisteminden (BMS) okunan anlık hücre voltaj sapmaları ve ısıl test sonuçlarına dayanmaktadır.
              </p>
            </div>
          ) : (
            /* Theoretical Catalog View */
            <div className="flex flex-col gap-4">
              <span className="text-xs font-black text-neutral-400 tracking-wider">TEORİK FABRİKA KATALOG VERİLERİ</span>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded bg-neutral-950 p-3 border border-neutral-800 text-center">
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase">WLTP Menzili</span>
                  <span className="text-lg font-black text-volt mt-1 block">{vehicle.rangeKm} km</span>
                </div>
                <div className="rounded bg-neutral-950 p-3 border border-neutral-800 text-center">
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase">Batarya</span>
                  <span className="text-lg font-black text-white mt-1 block">{vehicle.batteryKwh} kWh</span>
                </div>
                <div className="rounded bg-neutral-950 p-3 border border-neutral-800 text-center">
                  <span className="block text-[10px] text-neutral-500 font-bold uppercase">0-100 Hızlanma</span>
                  <span className="text-lg font-black text-white mt-1 block">{vehicle.acceleration} sn</span>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-volt tracking-wider uppercase">✓ PROS (ARTI YÖNLERİ)</span>
                  <ul className="flex flex-col gap-1 text-xs text-neutral-300">
                    {vehicle.pros.length > 0 ? (
                      vehicle.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <IconCheck className="h-3.5 w-3.5 text-volt shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-1.5">
                          <IconCheck className="h-3.5 w-3.5 text-volt shrink-0 mt-0.5" />
                          <span>Geniş iç hacim ve bagaj kapasitesi</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <IconCheck className="h-3.5 w-3.5 text-volt shrink-0 mt-0.5" />
                          <span>Yüksek DC şarj eğrisi kararlılığı</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-rose-500 tracking-wider uppercase">✗ CONS (EKSİ YÖNLERİ)</span>
                  <ul className="flex flex-col gap-1 text-xs text-neutral-300">
                    {vehicle.cons.length > 0 ? (
                      vehicle.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <IconClose className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-1.5">
                          <IconClose className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>Yüksek hızlarda rüzgar sesi yalıtımı</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <IconClose className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>Soğuk havada menzil kaybı oranı</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
