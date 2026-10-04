"use client";

import React, { useState } from "react";
import {
  IconLayers,
  IconComment,
  IconPin,
  IconShield,
  IconMap,
  IconCheck,
  IconBolt,
  IconBattery,
} from "@/components/ui/Icons";
import CarDamageReport from "@/components/listings/CarDamageReport";
import ListingLocationMap from "@/components/listings/ListingLocationMap";

export type ListingDetailData = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  district?: string | null;
  color?: string | null;
  damage?: string | null;
  batteryHealth?: number | null;
  description?: string | null;
  expertise?: any;
  vehicle?: {
    batteryKwh?: number | null;
    rangeKm?: number | null;
    dcChargeKw?: number | null;
    powerHp?: number | null;
    accelSec?: number | null;
    bodyType?: string | null;
    heatPump?: string | null;
    v2l?: string | null;
  } | null;
};

type TabKey = "teknik" | "aciklama" | "konum" | "ekspertiz";

export default function ListingDetailTabs({ listing }: { listing: ListingDetailData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("teknik");

  const hasDescription = Boolean(listing.description && listing.description.trim().length > 0);
  const locationLabel = [listing.district, listing.city].filter(Boolean).join(", ");

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      key: "teknik",
      label: "Teknik Bilgiler & Donanım",
      icon: <IconLayers className="h-4 w-4 shrink-0" />,
      badge: `${listing.year}`,
    },
    {
      key: "aciklama",
      label: "Açıklama",
      icon: <IconComment className="h-4 w-4 shrink-0" />,
      badge: hasDescription ? "Dolu" : undefined,
    },
    {
      key: "konum",
      label: "Konum",
      icon: <IconPin className="h-4 w-4 shrink-0" />,
      badge: listing.city,
    },
    {
      key: "ekspertiz",
      label: "Ekspertiz",
      icon: <IconShield className="h-4 w-4 shrink-0" />,
      badge: listing.damage ? "13 Parça" : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sm:p-5 shadow-sm">
      {/* 1. SEÇİCİ TAB ÇUBUĞU (Mobilde Yatay Kaydırılabilir, Masaüstünde Tam Genişlik) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-neutral-150 pb-2.5 -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-black transition-all duration-150 shrink-0 select-none ${
                isActive
                  ? "bg-neutral-950 text-white shadow-xs ring-1 ring-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-950"
              }`}
            >
              <span className={isActive ? "text-sky-400" : "text-neutral-500"}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. AKTİF TAB İÇERİĞİ — Tıklanan Kısım Tek Başına Görünür */}
      <div className="pt-1">
        {/* TAB 1: TEKNİK BİLGİLER & DONANIM */}
        {activeTab === "teknik" && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                  <IconLayers className="h-4 w-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-neutral-900">
                  Teknik Bilgiler &amp; Donanım Detayı
                </h3>
              </div>
              <span className="text-[11px] font-bold text-neutral-400">
                İlan No: #{listing.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Marka &amp; Model</span>
                <span className="font-black text-neutral-900">
                  {listing.brand} {listing.model}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Model Yılı</span>
                <span className="font-black text-neutral-900">{listing.year}</span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Kilometre</span>
                <span className="font-black text-neutral-900">
                  {listing.km.toLocaleString("tr-TR")} km
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Batarya Kapasitesi</span>
                <span className="font-black text-blue-700">
                  {listing.vehicle?.batteryKwh ? `${listing.vehicle.batteryKwh} kWh` : "Belirtilmemiş"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Menzil (WLTP)</span>
                <span className="font-black text-emerald-700">
                  {listing.vehicle?.rangeKm ? `${listing.vehicle.rangeKm} km` : "Katalog Verisi"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">DC Hızlı Şarj</span>
                <span className="font-black text-neutral-900">
                  {listing.vehicle?.dcChargeKw ? `${listing.vehicle.dcChargeKw} kW Max` : "Standart DC"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Motor Gücü</span>
                <span className="font-black text-neutral-900">
                  {listing.vehicle?.powerHp ? `${listing.vehicle.powerHp} HP` : "Elektrik Motoru"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">0-100 Hızlanma</span>
                <span className="font-black text-neutral-900">
                  {listing.vehicle?.accelSec ? `${listing.vehicle.accelSec} sn` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Vites / Aktarma</span>
                <span className="font-black text-neutral-900">Otomatik (1 İleri EV)</span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Batarya Sağlığı (SoH)</span>
                <span className="font-black text-emerald-600">
                  %{listing.batteryHealth || 95}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Renk</span>
                <span className="font-black text-neutral-900">{listing.color || "Belirtilmemiş"}</span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                <span className="font-medium text-neutral-500">Boya / Değişen Beyanı</span>
                <span className="font-black text-neutral-900">
                  {listing.damage || "Ekspertiz Sekmesinde"}
                </span>
              </div>

              {listing.vehicle?.heatPump && (
                <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                  <span className="font-medium text-neutral-500">Isı Pompası</span>
                  <span className="font-black text-emerald-600">{listing.vehicle.heatPump}</span>
                </div>
              )}

              {listing.vehicle?.v2l && (
                <div className="flex items-center justify-between border-b border-neutral-100 py-1.5">
                  <span className="font-medium text-neutral-500">V2L Desteği</span>
                  <span className="font-black text-blue-600">{listing.vehicle.v2l}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SATICI AÇIKLAMASI */}
        {activeTab === "aciklama" && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <IconComment className="h-4 w-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-neutral-900">
                  Satıcı Açıklaması
                </h3>
              </div>
              <span className="text-[11px] font-bold text-neutral-400">
                {listing.city} · {listing.year}
              </span>
            </div>

            {hasDescription ? (
              <div className="rounded-xl bg-neutral-50/80 p-4 border border-neutral-200/80">
                <p className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-800 font-medium select-text">
                  {listing.description}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-neutral-50 p-6 text-center text-sm font-bold text-neutral-500 border border-neutral-200/60">
                Satıcı tarafından bu ilan için özel bir açıklama girilmemiştir.
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
              <span>* İlan açıklamasında yer alan beyanlar satıcının sorumluluğundadır.</span>
            </div>
          </div>
        )}

        {/* TAB 3: ARAÇ KONUMU */}
        {activeTab === "konum" && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <IconPin className="h-4 w-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-neutral-900">
                  Araç Konumu &amp; Harita
                </h3>
              </div>
              <span className="text-[11px] font-bold text-neutral-500">
                {locationLabel || "Türkiye"}
              </span>
            </div>

            <ListingLocationMap city={listing.city} district={listing.district} />
          </div>
        )}

        {/* TAB 4: EKSPERTİZ & HASAR DURUMU */}
        {activeTab === "ekspertiz" && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <IconShield className="h-4 w-4" />
                </span>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-neutral-900">
                  13 Parça Kaporta &amp; Ekspertiz Durumu
                </h3>
              </div>
              <span className="text-[11px] font-bold text-neutral-500">
                {listing.damage || "Beyan Belirtilmedi"}
              </span>
            </div>

            <CarDamageReport value={listing.expertise} editable={false} />
          </div>
        )}
      </div>
    </div>
  );
}
