"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CampaignItem {
  id: string;
  brand: string;
  model: string;
  vehicleImage: string;
  brandColor: string;
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
    model: "T10X V2 Uzun Menzil",
    vehicleImage: "https://dolubatarya.com/uploads/2021/12/2023-togg-t10x-ozellikler-teknik.jpg",
    brandColor: "#00A3E0",
    bankPartner: "Kamu Bankaları (Ziraat Bankası)",
    bankLogoText: "ZİRAAT",
    bankLogoBg: "bg-red-600",
    bankLogoColor: "text-white",
    bankUrl: "https://www.ziraatbank.com.tr/tr/bireysel/krediler",
    loanAmount: "800.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "%0 Faiz Fırsatı",
    perks: [
      "800.000 TL kredi tutarı için 12 ay %0 faiz desteği",
      "Alternatif: 1.000.000 TL 24 ay %1.99 faiz seçeneği",
      "Kamu bankaları özel tahsisli öncelikli kredi onayı",
    ],
    vehicleSlug: "togg-t10x-v2-2026",
    expiryDate: "Ay Sonu Geçerli",
    type: "zero-interest",
  },
  {
    id: "tesla-garanti",
    brand: "Tesla",
    model: "Model Y RWD 'Juniper'",
    vehicleImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop",
    brandColor: "#E82127",
    bankPartner: "Garanti BBVA",
    bankLogoText: "GARANTİ",
    bankLogoBg: "bg-emerald-600",
    bankLogoColor: "text-white",
    bankUrl: "https://www.garantibbva.com.tr/krediler/tasit-kredisi",
    loanAmount: "400.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.49 FAİZ",
    tag: "Takas Desteği",
    perks: [
      "50.000 TL doğrudan nakit takas teşviki",
      "Garanti BBVA ile %1.49 avantajlı taşıt kredisi",
      "Envanterden 7 günde hemen teslimat taahhüdü",
    ],
    vehicleSlug: "tesla-model-y-juniper-2026",
    expiryDate: "Sınırlı Kontenjan",
    type: "trade-in",
  },
  {
    id: "hyundai-yapi-kredi",
    brand: "Hyundai",
    model: "Inster & Ioniq 5",
    vehicleImage: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
    brandColor: "#002C6C",
    bankPartner: "Yapı Kredi",
    bankLogoText: "YAPI KREDİ",
    bankLogoBg: "bg-blue-700",
    bankLogoColor: "text-white",
    bankUrl: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler",
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Şarj Hediyesi",
    perks: [
      "300.000 TL için 12 ay %0.99 faizli finansman",
      "1 Yıllık Ücretsiz Eşarj şarj paketi hediyesi",
      "WorldCard sahiplerine özel kasko indirimi",
    ],
    vehicleSlug: "hyundai-inster",
    expiryDate: "Ay Sonuna Kadar",
    type: "green-loan",
  },
  {
    id: "kia-kuveyt",
    brand: "Kia",
    model: "EV3 Long Range & EV6",
    vehicleImage: "https://dolubatarya.com/uploads/2025/02/kia-ev4-saloon-standard-range-3182.jpeg",
    brandColor: "#05141F",
    bankPartner: "Kuveyt Türk",
    bankLogoText: "KUVEYT TÜRK",
    bankLogoBg: "bg-teal-700",
    bankLogoColor: "text-white",
    bankUrl: "https://www.kuveytturk.com.tr/kendim-icin/finansmanlar/arac-finansmanlari",
    loanAmount: "250.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Yeşil Taşıt Kredisi",
    perks: [
      "Çevreci yeşil taşıt kredisi ile %0.99 kâr payı desteği",
      "EV3 alımlarında 20.000 TL takas desteği",
      "5 yıl / 150.000 km araç ve batarya garantisi",
    ],
    vehicleSlug: "kia-ev3-long-range-2026",
    expiryDate: "Güncel Kampanya",
    type: "green-loan",
  },
  {
    id: "renault-qnb",
    brand: "Renault",
    model: "Megane E-Tech & R5",
    vehicleImage: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/new-editorial/megane-bcb-overview-001-desktop.jpg.ximg.large.webp/faac0803d5.webp",
    brandColor: "#FFCC00",
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
      "200.000 TL için 12 ay %0 faiz imkanı",
      "Bireysel alımlarda dosya masrafı muafiyeti",
      "Ev tipi şarj ünitesi (Wallbox) kurulum indirimi",
    ],
    vehicleSlug: "renault-megane-e-tech",
    expiryDate: "Stoklarla Sınırlı",
    type: "zero-interest",
  },
  {
    id: "byd-is-bankasi",
    brand: "BYD",
    model: "Seal 160 kW & Atto 3",
    vehicleImage: "https://dolubatarya.com/uploads/2025/07/byd-seal-160-kw-2792.webp",
    brandColor: "#1B365D",
    bankPartner: "Türkiye İş Bankası",
    bankLogoText: "İŞ BANKASI",
    bankLogoBg: "bg-blue-900",
    bankLogoColor: "text-white",
    bankUrl: "https://www.isbank.com.tr/tasit-kredisi",
    loanAmount: "350.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.29 FAİZ",
    tag: "Özel Finansman",
    perks: [
      "350.000 TL için %1.29 avantajlı taşıt kredisi",
      "İş Bankası Çevreci Taşıt Kredisi özel faiz indirimi",
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
    <section className="flex flex-col gap-4.5 rounded-2xl border border-neutral-300/80 bg-white p-5 sm:p-7 shadow-sm ring-1 ring-black/5">
      {/* 1. ÜST BAŞLIK & FİLTRELER (Modern Kurumsal Tipografi) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 border-b border-neutral-200 pb-4.5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
              ARAÇ KAMPANYALARI &amp; FİNANSMAN
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-1">
            Resmî distribütör ve anlaşmalı banka kredileri, %0 faiz desteği ve yeşil taşıt finansmanı fırsatları
          </p>
        </div>

        {/* Sağ: Finansman Hesaplayıcı Linki & Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/finansman"
            className="text-xs font-black text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5"
          >
            <span>Kredi &amp; Vergi Hesaplayıcı</span>
            <span>→</span>
          </Link>

          {/* Filtre Butonları */}
          <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${
                filter === "all"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Tümü ({CAMPAIGNS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("zero-interest")}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${
                filter === "zero-interest"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-red-600"
              }`}
            >
              %0 Faiz
            </button>
            <button
              type="button"
              onClick={() => setFilter("green-loan")}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${
                filter === "green-loan"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Yeşil Taşıt Kredisi
            </button>
            <button
              type="button"
              onClick={() => setFilter("trade-in")}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${
                filter === "trade-in"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Takas Desteği
            </button>
          </div>
        </div>
      </div>

      {/* 2. KAMPANYA KARTLARI GRİDİ (Model Resmi + Banka Logosu + Büyük Kalın Metinler) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-neutral-300/90 bg-white p-4.5 transition-all duration-200 hover:border-neutral-950 hover:shadow-lg ring-1 ring-black/5"
          >
            <div>
              {/* Üst Kısım: Banka Logosu/İsmi & Faiz Rozeti */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-150 pb-3 mb-3.5">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black text-neutral-800 hover:text-red-600 transition truncate max-w-[68%]"
                  title={`${item.bankPartner} resmi krediler sayfasına git`}
                >
                  {/* Banka Logosu Rozeti */}
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs shrink-0 ${item.bankLogoBg} ${item.bankLogoColor}`}
                  >
                    {item.bankLogoText}
                  </span>
                  <span className="truncate">{item.bankPartner}</span>
                  <span className="text-neutral-400 group-hover:text-red-600 text-xs">↗</span>
                </a>

                {/* Faiz Oranı Rozeti (Büyük & Kalın) */}
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider shrink-0 ${
                    item.interestRate.includes("%0")
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-neutral-950 text-white shadow-xs"
                  }`}
                >
                  {item.interestRate}
                </span>
              </div>

              {/* Araç Model Bilgisi + Model Resmi + Marka Rozeti */}
              <div className="flex items-center gap-3 mb-3.5">
                {/* Küçük Model Görseli */}
                <div className="relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-2xs group-hover:border-neutral-400 transition">
                  <img
                    src={item.vehicleImage}
                    alt={`${item.brand} ${item.model}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Marka & Model Başlığı (Büyük & Kalın) */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-red-600 uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider bg-neutral-100 px-1.5 py-0.2 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <Link
                    href={`/araclar/${item.vehicleSlug}`}
                    className="text-sm sm:text-base font-black text-neutral-950 group-hover:text-red-600 transition leading-snug truncate mt-0.5"
                    title={`${item.brand} ${item.model} teknik özelliklerini incele`}
                  >
                    {item.model}
                  </Link>
                </div>
              </div>

              {/* Finansal Metrik Kutuları (Büyük & Kalın Sayılar) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                    Kredi Tutarı
                  </span>
                  <span className="text-xs sm:text-sm font-black text-neutral-950 tracking-tight block mt-0.5">
                    {item.loanAmount}
                  </span>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                    Vade Süresi
                  </span>
                  <span className="text-xs sm:text-sm font-black text-neutral-950 tracking-tight block mt-0.5">
                    {item.maturity}
                  </span>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                    Kredi Oranı
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-black tracking-tight block mt-0.5 ${
                      item.interestRate.includes("%0") ? "text-red-600" : "text-neutral-950"
                    }`}
                  >
                    {item.interestRate}
                  </span>
                </div>
              </div>

              {/* Kampanya Avantajları (Perks) */}
              <ul className="mt-3.5 flex flex-col gap-1.5 text-xs text-neutral-700 font-medium">
                {item.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-red-600 font-black shrink-0 text-xs mt-0.5">✓</span>
                    <span className="font-semibold text-neutral-800">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alt Butonlar & Bağlantılar */}
            <div className="mt-4 pt-3.5 border-t border-neutral-150 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-neutral-500 shrink-0">
                ⏳ {item.expiryDate}
              </span>

              <div className="flex items-center gap-2">
                {/* Doğrulanmış Resmî Banka Linki */}
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-black text-neutral-800 hover:bg-neutral-100 hover:text-black transition shadow-2xs"
                  title="Resmî banka kredi sayfasına git"
                >
                  <span>Banka Detayı</span>
                  <span className="text-[10px]">↗</span>
                </a>

                {/* Model Sayfası Linki */}
                <Link
                  href={`/araclar/${item.vehicleSlug}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-neutral-950 px-3.5 py-1.5 text-xs font-black text-white hover:bg-red-600 transition shadow-xs"
                >
                  <span>Modeli Gör</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
