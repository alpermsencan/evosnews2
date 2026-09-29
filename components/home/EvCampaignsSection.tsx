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
    model: "T10X V2 Uzun Menzil",
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
      "Alternatif: 1.000.000 TL 24 ay %1.99 faiz",
      "Kamu bankaları özel tahsisli öncelikli kredi onayı",
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
    tag: "Takas Desteği",
    perks: [
      "50.000 TL doğrudan nakit takas teşviki",
      "Garanti BBVA ile %1.49 avantajlı finansman",
      "Envanterden 7 günde hemen teslimat taahhüdü",
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
    model: "Inster & Ioniq 5",
    vehicleImage: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
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
    brand: "KIA",
    brandBadgeBg: "bg-black",
    brandBadgeColor: "text-white",
    model: "EV3 Long Range & EV6",
    vehicleImage: "https://dolubatarya.com/uploads/2025/02/kia-ev4-saloon-standard-range-3182.jpeg",
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
      "Çevreci yeşil taşıt kredisi ile %0.99 kâr payı",
      "EV3 alımlarında 20.000 TL takas desteği",
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
    model: "Megane E-Tech & R5",
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
    brandBadgeBg: "bg-[#1B365D]",
    brandBadgeColor: "text-white",
    model: "Seal 160 kW & Atto 3",
    vehicleImage: "https://dolubatarya.com/uploads/2025/07/byd-seal-160-kw-2792.webp",
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
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-300/80 bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
      {/* 1. ÜST BAŞLIK & FİLTRELER (Kurumsal Modern Başlık) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
              ARAÇ KAMPANYALARI &amp; FİNANSMAN TABLOSU
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-1">
            Resmî distribütör ve anlaşmalı banka kredileri, %0 faiz desteği ve yeşil taşıt finansmanı fırsatları
          </p>
        </div>

        {/* Filtre Butonları (Finansman sayfası link butonu kaldırıldı) */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold border border-neutral-200/80 shrink-0">
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

      {/* 2. KURUMSAL MODERN FİNANSMAN TABLOSU (Masaüstü & Tablet Tablo Görünümü) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-neutral-250">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-950 text-white text-[11px] font-black uppercase tracking-wider">
              <th className="py-3 px-3.5">Araç &amp; Model</th>
              <th className="py-3 px-3.5">Anlaşmalı Banka</th>
              <th className="py-3 px-3.5">Kredi Tutarı</th>
              <th className="py-3 px-3.5">Vade</th>
              <th className="py-3 px-3.5">Faiz Oranı</th>
              <th className="py-3 px-3.5">Öne Çıkan Avantaj</th>
              <th className="py-3 px-3.5 text-right">Başvuru &amp; İncele</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs font-bold text-neutral-800">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-neutral-50/90 transition group"
              >
                {/* 1. Sütun: Araç Marka Rozeti + Model Resmi + Model İsmi */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    {/* Marka Rozeti */}
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 shadow-2xs ${item.brandBadgeBg} ${item.brandBadgeColor}`}
                    >
                      {item.brand}
                    </span>

                    {/* Küçük Model Görseli */}
                    <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 shadow-2xs group-hover:border-neutral-400 transition">
                      <img
                        src={item.vehicleImage}
                        alt={`${item.brand} ${item.model}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    {/* Model İsmi Linki */}
                    <Link
                      href={`/araclar/${item.vehicleSlug}`}
                      className="text-xs sm:text-sm font-black text-neutral-950 group-hover:text-red-600 transition"
                      title={`${item.brand} ${item.model} detaylarını incele`}
                    >
                      {item.model}
                    </Link>
                  </div>
                </td>

                {/* 2. Sütun: Banka Logosu & Banka İsmi */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <a
                    href={item.bankUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-red-600 transition"
                    title={`${item.bankPartner} resmi kredi sayfasına git`}
                  >
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs shrink-0 ${item.bankLogoBg} ${item.bankLogoColor}`}
                    >
                      {item.bankLogoText}
                    </span>
                    <span className="font-black text-neutral-900">{item.bankPartner}</span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-red-600">↗</span>
                  </a>
                </td>

                {/* 3. Sütun: Kredi Tutarı */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-black text-neutral-950">
                    {item.loanAmount}
                  </span>
                </td>

                {/* 4. Sütun: Vade */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="text-xs font-black text-neutral-800">
                    {item.maturity}
                  </span>
                </td>

                {/* 5. Sütun: Faiz Oranı */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wider ${
                      item.interestRate.includes("%0")
                        ? "bg-red-600 text-white shadow-2xs"
                        : "bg-neutral-900 text-white shadow-2xs"
                    }`}
                  >
                    {item.interestRate}
                  </span>
                </td>

                {/* 6. Sütun: Öne Çıkan Avantaj */}
                <td className="py-3 px-3.5 text-neutral-600 max-w-[220px]">
                  <span className="line-clamp-1 text-[11px] font-semibold text-neutral-700">
                    {item.perks[0]}
                  </span>
                </td>

                {/* 7. Sütun: Butonlar */}
                <td className="py-3 px-3.5 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <a
                      href={item.bankUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-black text-neutral-800 hover:bg-neutral-100 transition shadow-2xs"
                      title="Resmî banka kredi sayfası"
                    >
                      Banka ↗
                    </a>
                    <Link
                      href={`/araclar/${item.vehicleSlug}`}
                      className="rounded-lg bg-neutral-950 px-2.5 py-1 text-[11px] font-black text-white hover:bg-red-600 transition shadow-2xs"
                    >
                      İncele →
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. MOBİL & TABLET KART GÖRÜNÜMÜ (Ekran Dar İken Kusursuz Okunabilirlik) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-xl border border-neutral-300/90 bg-white p-4 transition hover:border-neutral-950 shadow-xs"
          >
            <div>
              {/* Üst Satır: Banka Logosu + Faiz Oranı */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-150 pb-2.5 mb-3">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 truncate"
                >
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs shrink-0 ${item.bankLogoBg} ${item.bankLogoColor}`}
                  >
                    {item.bankLogoText}
                  </span>
                  <span className="truncate">{item.bankPartner}</span>
                  <span className="text-neutral-400 text-xs">↗</span>
                </a>

                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wider shrink-0 ${
                    item.interestRate.includes("%0")
                      ? "bg-red-600 text-white shadow-2xs"
                      : "bg-neutral-950 text-white shadow-2xs"
                  }`}
                >
                  {item.interestRate}
                </span>
              </div>

              {/* Araç Modeli + Görsel */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-2xs">
                  <img
                    src={item.vehicleImage}
                    alt={`${item.brand} ${item.model}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${item.brandBadgeBg} ${item.brandBadgeColor}`}
                    >
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <Link
                    href={`/araclar/${item.vehicleSlug}`}
                    className="text-xs sm:text-sm font-black text-neutral-950 truncate mt-0.5"
                  >
                    {item.model}
                  </Link>
                </div>
              </div>

              {/* Finansman Değerleri */}
              <div className="grid grid-cols-2 gap-2 text-center py-2 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Kredi Tutarı</span>
                  <span className="text-xs font-black text-neutral-950 block">{item.loanAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Vade</span>
                  <span className="text-xs font-black text-neutral-950 block">{item.maturity}</span>
                </div>
              </div>

              {/* Avantaj */}
              <p className="mt-2.5 text-[11px] font-semibold text-neutral-700 leading-snug">
                ✓ {item.perks[0]}
              </p>
            </div>

            {/* Alt Butonlar */}
            <div className="mt-3 pt-2.5 border-t border-neutral-150 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-400">⏳ {item.expiryDate}</span>
              <div className="flex items-center gap-1.5">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-black text-neutral-800"
                >
                  Banka ↗
                </a>
                <Link
                  href={`/araclar/${item.vehicleSlug}`}
                  className="rounded-lg bg-neutral-950 px-3 py-1 text-[11px] font-black text-white"
                >
                  İncele →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
