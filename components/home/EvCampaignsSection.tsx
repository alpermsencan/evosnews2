"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CampaignItem {
  id: string;
  brand: string;
  model: string;
  bankPartner: string;
  bankUrl: string;
  loanAmount: string;
  maturity: string;
  interestRate: string;
  tag: string;
  tagColor: "red" | "black" | "neutral";
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
    bankPartner: "Kamu Bankaları (Ziraat, Vakıf, Halk)",
    bankUrl: "https://www.ziraatbank.com.tr/tr/bireysel/krediler/tasit-kredisi",
    loanAmount: "800.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "%0 Faiz Fırsatı",
    tagColor: "red",
    perks: [
      "800.000 TL kredi tutarı için 12 ay %0 faiz desteği",
      "Alternatif: 1.000.000 TL 24 ay %1.99 faiz seçeneği",
      "Kamu bankaları özel tahsisli öncelikli onay",
    ],
    vehicleSlug: "togg-t10x-v2-2026",
    expiryDate: "Ay Sonu Geçerli",
    type: "zero-interest",
  },
  {
    id: "tesla-garanti",
    brand: "Tesla",
    model: "Model Y RWD 'Juniper'",
    bankPartner: "Garanti BBVA & Akbank",
    bankUrl: "https://www.garantibbva.com.tr/krediler/tasit-kredisi/elektrikli-arac-kredisi",
    loanAmount: "400.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.49 FAİZ",
    tag: "Takas Desteği",
    tagColor: "black",
    perks: [
      "50.000 TL doğrudan nakit takas teşviki",
      "Anlaşmalı bankalarda %1.49 özel faiz oranı",
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
    bankPartner: "Yapı Kredi",
    bankUrl: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler/tasit-kredileri/doga-dostu-tasit-kredisi",
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Şarj Hediyesi",
    tagColor: "neutral",
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
    id: "kia-kuveyt-garanti",
    brand: "Kia",
    model: "EV3 & EV6 GT-Line",
    bankPartner: "Kuveyt Türk & Garanti BBVA",
    bankUrl: "https://www.kuveytturk.com.tr/bireysel/finansmanlar/arac-finansmani/yesil-arac-finansmani",
    loanAmount: "250.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Yeşil Taşıt Kredisi",
    tagColor: "red",
    perks: [
      "Çevreci yeşil taşıt kredisi ile %0.99 kâr payı / faiz",
      "EV3 alımlarında 20.000 TL takas desteği",
      "5 yıl / 150.000 km araç ve batarya garantisi",
    ],
    vehicleSlug: "kia-ev3-long-range-2026",
    expiryDate: "Güncel",
    type: "green-loan",
  },
  {
    id: "renault-qnb",
    brand: "Renault",
    model: "5 E-Tech & Megane E-Tech",
    bankPartner: "QNB & TEB",
    bankUrl: "https://www.qnb.com.tr/bireysel/krediler/tasit-kredisi",
    loanAmount: "200.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "%0 Faiz",
    tagColor: "red",
    perks: [
      "200.000 TL için 12 ay %0 faiz imkanı",
      "Bireysel alımlarda dosya masrafı muafiyeti",
      "Ev tipi şarj ünitesi (Wallbox) kurulum indirimi",
    ],
    vehicleSlug: "renault-5",
    expiryDate: "Stoklarla Sınırlı",
    type: "zero-interest",
  },
  {
    id: "byd-is-bankasi",
    brand: "BYD",
    model: "Atto 3 & Seal",
    bankPartner: "Türkiye İş Bankası",
    bankUrl: "https://www.isbank.com.tr/cevreye-duyarli-tasit-kredisi",
    loanAmount: "350.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.29 FAİZ",
    tag: "Özel Finansman",
    tagColor: "black",
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
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs">
      {/* Üst Başlık & Filtreler */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-600" />
            </div>
            <h2 className="text-base font-black tracking-tight text-neutral-900 uppercase">
              ARAÇ KAMPANYALARI & FİNANSMAN
            </h2>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Türkiye&apos;deki resmî marka ve banka işbirlikleri, sıfır faiz ve yeşil taşıt kredisi fırsatları
          </p>
        </div>

        {/* Sağ: Finansman Hesaplayıcı Linki & Filtreler */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/finansman"
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
          >
            <span>Kredi & Vergi Hesapla</span>
            <span>→</span>
          </Link>

          {/* Filtre Butonları */}
          <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
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
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "zero-interest"
                  ? "bg-neutral-950 text-white shadow-xs"
                  : "text-neutral-600 hover:text-red-600"
              }`}
            >
              %0 Faiz
            </button>
            <button
              type="button"
              onClick={() => setFilter("green-loan")}
              className={`px-3 py-1.5 rounded-lg transition ${
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
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "trade-in"
                  ? "bg-neutral-950 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Takas & İndirim
            </button>
          </div>
        </div>
      </div>

      {/* Kampanya Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-neutral-50/40 p-4 transition-all hover:border-red-600/40 hover:bg-white hover:shadow-md"
          >
            <div>
              {/* Üst Rozetler (Banka Linki & Faiz Oranı) */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-150 pb-2.5 mb-3">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-red-600 transition truncate max-w-[65%]"
                  title={`${item.bankPartner} resmi kredi detay sayfasına git`}
                >
                  <span className="truncate">{item.bankPartner}</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-red-500">↗</span>
                </a>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    item.interestRate.includes("%0")
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {item.interestRate}
                </span>
              </div>

              {/* Model & Marka Başlığı (Doğrudan Model Sayfasına Linkli) */}
              <Link
                href={`/araclar/${item.vehicleSlug}`}
                className="group/title flex items-baseline gap-1.5 hover:opacity-90 transition"
              >
                <span className="text-xs font-black text-red-600 uppercase tracking-wider">
                  {item.brand}
                </span>
                <h3 className="text-sm font-black text-neutral-950 tracking-tight group-hover/title:text-red-600 transition">
                  {item.model}
                </h3>
              </Link>

              {/* Finansal Metrik Kutuları */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg border border-neutral-200/80 bg-white p-2">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 block">Kredi</span>
                  <span className="text-xs font-black text-neutral-900 tracking-tight block mt-0.5">
                    {item.loanAmount}
                  </span>
                </div>
                <div className="rounded-lg border border-neutral-200/80 bg-white p-2">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 block">Vade</span>
                  <span className="text-xs font-black text-neutral-900 tracking-tight block mt-0.5">
                    {item.maturity}
                  </span>
                </div>
                <div className="rounded-lg border border-neutral-200/80 bg-white p-2">
                  <span className="text-[9px] font-bold uppercase text-neutral-400 block">Oran</span>
                  <span className={`text-xs font-black tracking-tight block mt-0.5 ${item.interestRate.includes("%0") ? "text-red-600" : "text-neutral-900"}`}>
                    {item.interestRate}
                  </span>
                </div>
              </div>

              {/* Kampanya Avantajları (Perks) */}
              <ul className="mt-3 flex flex-col gap-1.5 text-[11px] text-neutral-600">
                {item.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-red-600 font-bold shrink-0">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alt Butonlar & Bağlantılar */}
            <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-neutral-400 shrink-0">
                ⏳ {item.expiryDate}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={item.bankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition shadow-2xs"
                  title="Resmî banka kredi sayfasına git"
                >
                  <span>Banka Detayı</span>
                  <span className="text-[10px]">↗</span>
                </a>

                <Link
                  href={`/araclar/${item.vehicleSlug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-950 px-2.5 py-1 text-[11px] font-black text-white hover:bg-red-600 transition shadow-xs"
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
