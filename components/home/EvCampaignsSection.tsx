"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CampaignItem {
  id: string;
  brand: string;
  brandBadgeBg: string;
  brandBadgeColor: string;
  model: string;
  vehicleImage: string;
  bankPartner: string;
  bankLogoText: string;
  bankLogoBg: string;
  bankLogoColor: string;
  bankUrl: string;
  loanAmount: string;
  maturity: string;
  interestRate: string;
  tag: string;
  perks: string[];
  vehicleSlug: string;
  expiryDate: string;
  type: "zero-interest" | "green-loan" | "trade-in" | "all";
}

const CAMPAIGNS: CampaignItem[] = [
  {
    id: "togg-kamu",
    brand: "TOGG",
    brandBadgeBg: "bg-[#00A3E0]",
    brandBadgeColor: "text-white",
    model: "Togg T10X V2 Uzun Menzil",
    vehicleImage: "https://dolubatarya.com/uploads/2021/12/2023-togg-t10x-ozellikler-teknik.jpg",
    bankPartner: "Kamu Bankaları (Ziraat)",
    bankLogoText: "ZİRAAT",
    bankLogoBg: "bg-red-600",
    bankLogoColor: "text-white",
    bankUrl: "https://www.ziraatbank.com.tr/tr/bireysel/krediler",
    loanAmount: "800.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "%0 Faiz Fırsatı",
    perks: [
      "800.000 TL için 12 ay %0 faiz desteği",
      "Kamu bankaları özel tahsisli öncelikli onay",
    ],
    vehicleSlug: "togg-t10x-v2-2026",
    expiryDate: "Ay Sonu Geçerli",
    type: "zero-interest",
  },
  {
    id: "tesla-garanti",
    brand: "TESLA",
    brandBadgeBg: "bg-[#E82127]",
    brandBadgeColor: "text-white",
    model: "Model Y RWD 'Juniper'",
    vehicleImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop",
    bankPartner: "Garanti BBVA",
    bankLogoText: "GARANTİ BBVA",
    bankLogoBg: "bg-emerald-600",
    bankLogoColor: "text-white",
    bankUrl: "https://www.garantibbva.com.tr/krediler/tasit-kredisi",
    loanAmount: "400.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.49 FAİZ",
    tag: "Takas Teşviki",
    perks: [
      "50.000 TL doğrudan nakit takas teşviki",
      "Envanterden 7 günde hemen teslimat",
    ],
    vehicleSlug: "tesla-model-y-juniper-2026",
    expiryDate: "Sınırlı Kontenjan",
    type: "trade-in",
  },
  {
    id: "hyundai-yapi-kredi",
    brand: "HYUNDAI",
    brandBadgeBg: "bg-[#002C6C]",
    brandBadgeColor: "text-white",
    model: "Hyundai Inster & Ioniq 5",
    vehicleImage: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
    bankPartner: "Yapı Kredi",
    bankLogoText: "YAPI KREDİ",
    bankLogoBg: "bg-blue-700",
    bankLogoColor: "text-white",
    bankUrl: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler",
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Şarj Paketi",
    perks: [
      "300.000 TL için %0.99 avantajlı taşıt kredisi",
      "1 Yıllık ücretsiz Eşarj şarj paketi hediyesi",
    ],
    vehicleSlug: "hyundai-inster",
    expiryDate: "Ay Sonuna Kadar",
    type: "green-loan",
  },
  {
    id: "kia-kuveyt",
    brand: "KIA",
    brandBadgeBg: "bg-black",
    brandBadgeColor: "text-white",
    model: "Kia EV3 Long Range & EV6",
    vehicleImage: "https://dolubatarya.com/uploads/2025/02/kia-ev4-saloon-standard-range-3182.jpeg",
    bankPartner: "Kuveyt Türk",
    bankLogoText: "KUVEYT TÜRK",
    bankLogoBg: "bg-teal-700",
    bankLogoColor: "text-white",
    bankUrl: "https://www.kuveytturk.com.tr/kendim-icin/finansmanlar/arac-finansmanlari",
    loanAmount: "250.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 KÂR PAYI",
    tag: "Yeşil Taşıt",
    perks: [
      "Çevreci yeşil taşıt finansmanı imkanı",
      "5 yıl / 150.000 km araç ve batarya garantisi",
    ],
    vehicleSlug: "kia-ev3-long-range-2026",
    expiryDate: "Güncel Kampanya",
    type: "green-loan",
  },
  {
    id: "renault-qnb",
    brand: "RENAULT",
    brandBadgeBg: "bg-[#FFCC00]",
    brandBadgeColor: "text-neutral-950",
    model: "Renault Megane E-Tech & R5",
    vehicleImage: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/new-editorial/megane-bcb-overview-001-desktop.jpg.ximg.large.webp/faac0803d5.webp",
    bankPartner: "QNB",
    bankLogoText: "QNB",
    bankLogoBg: "bg-purple-900",
    bankLogoColor: "text-white",
    bankUrl: "https://www.qnb.com.tr",
    loanAmount: "200.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "%0 Faiz",
    perks: [
      "200.000 TL için 12 ay %0 faiz desteği",
      "Wallbox ev tipi şarj ünitesi kurulum avantajı",
    ],
    vehicleSlug: "renault-megane-e-tech",
    expiryDate: "Stoklarla Sınırlı",
    type: "zero-interest",
  },
  {
    id: "byd-is-bankasi",
    brand: "BYD",
    brandBadgeBg: "bg-[#1B365D]",
    brandBadgeColor: "text-white",
    model: "BYD Seal 160 kW & Atto 3",
    vehicleImage: "https://dolubatarya.com/uploads/2025/07/byd-seal-160-kw-2792.webp",
    bankPartner: "Türkiye İş Bankası",
    bankLogoText: "İŞ BANKASI",
    bankLogoBg: "bg-blue-900",
    bankLogoColor: "text-white",
    bankUrl: "https://www.isbank.com.tr/tasit-kredisi",
    loanAmount: "350.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.29 FAİZ",
    tag: "Blade Batarya",
    perks: [
      "350.000 TL için %1.29 çevreci taşıt kredisi",
      "8 yıl / 200.000 km Blade Batarya garantisi",
    ],
    vehicleSlug: "byd-seal-160-kw",
    expiryDate: "Stoklarla Sınırlı",
    type: "trade-in",
  },
];

export default function EvCampaignsSection() {
  const [filter, setFilter] = useState<"all" | "zero-interest" | "green-loan" | "trade-in">("all");

  const filtered =
    filter === "all" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.type === filter);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-neutral-300/80 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5">
      {/* 1. KURUMSAL BAŞLIK VE FİLTRELEME ŞERİDİ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
                ARAÇ KAMPANYALARI &amp; FİNANSMAN
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-0.5">
                Resmî distribütör ve banka anlaşmalı güncel faiz destekleri ve finansman fırsatları
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist Kurumsal Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-bold border border-neutral-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-black ${
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
            className={`px-3 py-1.5 rounded-lg transition text-xs font-black ${
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
            className={`px-3 py-1.5 rounded-lg transition text-xs font-black ${
              filter === "green-loan"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Yeşil Taşıt Kredisi
          </button>
          <button
            type="button"
            onClick={() => setFilter("trade-in")}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-black ${
              filter === "trade-in"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Takas Destekli
          </button>
        </div>
      </div>

      {/* 2. SADE, NET VE KURUMSAL FİNANSMAN KARTLARI (3'lü Grid, Karışıklıktan Uzak) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const isZeroInterest = item.interestRate.includes("%0");

          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-250 bg-white p-5 transition duration-200 hover:border-neutral-900 hover:shadow-md ring-1 ring-black/5"
            >
              <div>
                {/* Üst Satır: Marka Rozeti & Kampanya Etiketi */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs ${item.brandBadgeBg} ${item.brandBadgeColor}`}
                  >
                    {item.brand}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isZeroInterest
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Model Başlığı */}
                <h3 className="text-base font-black text-neutral-950 group-hover:text-red-600 transition truncate mb-3">
                  <Link href={`/araclar/${item.vehicleSlug}`}>{item.model}</Link>
                </h3>

                {/* Araç Fotoğrafı (Kompakt & Kurumsal) */}
                <div className="relative h-28 sm:h-32 w-full overflow-hidden rounded-xl border border-neutral-150 bg-neutral-100 mb-3">
                  <img
                    src={item.vehicleImage}
                    alt={`${item.brand} ${item.model}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 right-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                    {item.expiryDate}
                  </span>
                </div>

                {/* Finansman Özet Kutusu (Temiz & Kurumsal) */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50 p-3.5 mb-4">
                  <div className="flex items-baseline justify-between border-b border-neutral-200 pb-2 mb-2">
                    <span className="text-xs font-black text-neutral-500 uppercase">
                      Finansman Oranı
                    </span>
                    <span
                      className={`text-sm sm:text-base font-black ${
                        isZeroInterest ? "text-red-600" : "text-neutral-950"
                      }`}
                    >
                      {item.interestRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                    <span>
                      {item.loanAmount} · {item.maturity}
                    </span>
                    <a
                      href={item.bankUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-black text-neutral-700 hover:text-red-600 transition"
                      title={`${item.bankPartner} sayfasına git`}
                    >
                      <span className="truncate max-w-[110px]">{item.bankPartner}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                {/* Avantaj Maddeleri */}
                <ul className="flex flex-col gap-1.5 mb-5 text-xs text-neutral-600 font-semibold">
                  {item.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-black shrink-0">✓</span>
                      <span className="line-clamp-1">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-150">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-neutral-950 py-2.5 text-center text-xs font-black text-white hover:bg-red-600 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Banka Kredi Başvurusu</span>
                  <span className="text-xs">↗</span>
                </a>
                <Link
                  href={`/araclar/${item.vehicleSlug}`}
                  className="text-center text-[11px] font-bold text-neutral-500 hover:text-neutral-950 transition"
                >
                  Model Teknik Özelliklerini İncele →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
