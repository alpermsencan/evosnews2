"use client";

import React, { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";

interface CampaignItem {
  id: string;
  brand: string;
  model: string;
  vehicleImage: string;
  bankPartner: string;
  bankUrl: string;
  loanAmount: string;
  maturity: string;
  interestRate: string;
  isZeroPercent: boolean;
  tag: string;
  perks: string[];
  vehicleSlug: string;
  expiryDate: string;
  type: "zero-interest" | "green-loan" | "trade-in";
}

const CAMPAIGNS: CampaignItem[] = [
  {
    id: "togg-kamu",
    brand: "TOGG",
    model: "T10X V2 Uzun Menzil & T10F",
    vehicleImage: "https://dolubatarya.com/uploads/2021/12/2023-togg-t10x-ozellikler-teknik.jpg",
    bankPartner: "Kamu Bankaları (Ziraat · Vakıfbank · Halkbank)",
    bankUrl: "https://www.ziraatbank.com.tr/tr/bireysel/krediler/tasit-kredisi",
    loanAmount: "800.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    isZeroPercent: true,
    tag: "Resmî Destek",
    perks: [
      "800.000 TL için 12 ay %0 faiz kamu finansman desteği",
      "Trumore üzerinden 1 yıllık hediye Trugo şarj paketi",
    ],
    vehicleSlug: "togg-t10x-v2-2026",
    expiryDate: "2026 Güncel",
    type: "zero-interest",
  },
  {
    id: "tesla-garanti",
    brand: "TESLA",
    model: "Model Y RWD 'Juniper'",
    vehicleImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop",
    bankPartner: "Garanti BBVA & Akbank",
    bankUrl: "https://www.garantibbva.com.tr/krediler/tasit-kredisi",
    loanAmount: "500.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.49 FAİZ",
    isZeroPercent: false,
    tag: "Takas Teşviki",
    perks: [
      "50.000 TL doğrudan nakit takas indirimi desteği",
      "Tesla Türkiye resmi envanterinden 7 günde hemen teslim",
    ],
    vehicleSlug: "tesla-model-y-juniper-2026",
    expiryDate: "Sınırlı Kontenjan",
    type: "trade-in",
  },
  {
    id: "byd-alj",
    brand: "BYD",
    model: "BYD Atto 3 & Seal U",
    vehicleImage: "https://dolubatarya.com/uploads/2025/07/byd-seal-160-kw-2792.webp",
    bankPartner: "ALJ Finans & İş Bankası",
    bankUrl: "https://www.aljfinans.com",
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    isZeroPercent: true,
    tag: "%0 Faiz & Takas",
    perks: [
      "300.000 TL 12 ay %0 faiz veya 100.000 TL takas desteği",
      "8 yıl / 200.000 km resmi Blade Batarya garantisi",
    ],
    vehicleSlug: "byd-seal-160-kw",
    expiryDate: "Ay Sonu Geçerli",
    type: "zero-interest",
  },
  {
    id: "hyundai-inster",
    brand: "HYUNDAI",
    model: "Hyundai Inster & Ioniq 5",
    vehicleImage: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
    bankPartner: "Yapı Kredi Yeşil Taşıt",
    bankUrl: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler",
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    isZeroPercent: false,
    tag: "Şarj Paketi",
    perks: [
      "300.000 TL için %0.99 avantajlı çevreci taşıt kredisi",
      "1 Yıllık ücretsiz Eşarj şarj kartı hediyesi",
    ],
    vehicleSlug: "hyundai-inster",
    expiryDate: "Güncel Kampanya",
    type: "green-loan",
  },
  {
    id: "renault-megane",
    brand: "RENAULT",
    model: "Megane E-Tech & Scenic E-Tech",
    vehicleImage: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/new-editorial/megane-bcb-overview-001-desktop.jpg.ximg.large.webp/faac0803d5.webp",
    bankPartner: "Renault Finans (Orfin)",
    bankUrl: "https://www.renault.com.tr/kampanyalar/binek-arac-kampanyalari.html",
    loanAmount: "250.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    isZeroPercent: false,
    tag: "Orfin Finans",
    perks: [
      "250.000 TL için 12 ay %0.99 finansman desteği",
      "Ev tipi Wallbox kurulumunda indirim ve taksit avantajı",
    ],
    vehicleSlug: "renault-megane-e-tech",
    expiryDate: "Stoklarla Sınırlı",
    type: "green-loan",
  },
  {
    id: "kia-ev3",
    brand: "KIA",
    model: "Kia EV3 Long Range & EV6",
    vehicleImage: "https://www.kia.com/content/dam/kwcms/tr/tr/images/showroom/ev3/ozellikler/360/abp-gtl/kia-ev3-my25-gtl-abp-aurorablackpearl-19_0000.png",
    bankPartner: "Kuveyt Türk & Garanti BBVA",
    bankUrl: "https://www.kia.com.tr/kampanyalar",
    loanAmount: "200.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    isZeroPercent: true,
    tag: "%0 Faiz Desteği",
    perks: [
      "200.000 TL 12 ay %0 faiz kredi desteği",
      "5 yıl / 150.000 km araç ve yüksek voltaj batarya garantisi",
    ],
    vehicleSlug: "kia-ev3-long-range-2026",
    expiryDate: "Güncel",
    type: "zero-interest",
  },
];

export default function EvCampaignsSection() {
  const [filter, setFilter] = useState<"all" | "zero-interest" | "green-loan" | "trade-in">("all");

  const filtered =
    filter === "all" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.type === filter);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-7 shadow-xs">
      {/* 1. KURUMSAL BAŞLIK & SADE FİLTRELER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-sky-400 shadow-xs ring-1 ring-black/5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                2026 RESMÎ VERİLER
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight mt-1">
              ARAÇ KAMPANYALARI & FİNANSMAN
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Türkiye resmî distribütör ve banka anlaşmalı güncel faiz destekleri ve teşvikler
            </p>
          </div>
        </div>

        {/* Kurumsal Sade Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100/80 p-1 rounded-xl text-xs font-bold border border-neutral-200/60 shrink-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
              filter === "all"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Tümü ({CAMPAIGNS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("zero-interest")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
              filter === "zero-interest"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-red-600"
            }`}
          >
            %0 Faiz Fırsatları
          </button>
          <button
            type="button"
            onClick={() => setFilter("green-loan")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
              filter === "green-loan"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Yeşil Kredi
          </button>
          <button
            type="button"
            onClick={() => setFilter("trade-in")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
              filter === "trade-in"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Takas Destekli
          </button>
        </div>
      </div>

      {/* 2. SADE, MODERN VE KURUMSAL KAMPANYA KARTLARI (3'LÜ GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-neutral-50/40 hover:bg-white p-5 transition-all duration-300 hover:border-neutral-300 hover:shadow-lg ring-1 ring-black/5"
          >
            <div>
              {/* Üst Kısım: Marka Adı & Kampanya Türü */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  {item.brand}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    item.isZeroPercent
                      ? "border-red-200 bg-red-50 text-red-600 font-extrabold"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {item.tag}
                </span>
              </div>

              {/* Model İsmi */}
              <h3 className="text-base font-black text-neutral-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-3">
                <Link href={`/araclar/${item.vehicleSlug}`}>{item.model}</Link>
              </h3>

              {/* Araç Görseli */}
              <Link
                href={`/araclar/${item.vehicleSlug}`}
                className="relative block h-36 w-full overflow-hidden rounded-xl bg-white border border-neutral-200/70 mb-3.5 group/img"
              >
                <SafeImage
                  src={item.vehicleImage}
                  alt={`${item.brand} ${item.model}`}
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-105"
                  fallbackSrc="/arac-placeholder.svg"
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  {item.expiryDate}
                </span>
              </Link>

              {/* Finansman Oran Kutusu */}
              <div className="rounded-xl border border-neutral-200 bg-white p-3.5 mb-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                    Finansman Koşulu
                  </span>
                  <span
                    className={`text-sm font-black ${
                      item.isZeroPercent ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {item.interestRate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                  <span>
                    {item.loanAmount} · {item.maturity}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium truncate max-w-[120px]">
                    {item.bankPartner}
                  </span>
                </div>
              </div>

              {/* Avantajlar */}
              <ul className="flex flex-col gap-1.5 mb-4 text-xs text-neutral-600 font-medium">
                {item.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="line-clamp-1">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alt Butonlar */}
            <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
              <Link
                href={`/araclar/${item.vehicleSlug}`}
                className="flex-1 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-center py-2.5 text-xs font-bold transition shadow-xs"
              >
                Modeli İncele
              </Link>
              <a
                href={item.bankUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 transition shrink-0"
                title="Kampanya detayları"
              >
                Detay ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
