"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CampaignItem {
  id: string;
  brand: string;
  model: string;
  bankPartner: string;
  loanAmount: string;
  maturity: string;
  interestRate: string;
  tag: string;
  tagColor: "emerald" | "blue" | "purple" | "amber";
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
    bankPartner: "Kamu Bankaları (Ziraat, Vakıfbank, Halkbank)",
    loanAmount: "800.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "0 Faiz Avantajı",
    tagColor: "emerald",
    perks: [
      "800.000 TL kredi için 12 ay %0 faiz fırsatı",
      "Alternatif: 1.000.000 TL 24 ay %1.99 faiz seçeneği",
      "Kamu bankaları özel tahsisli hızlı onay",
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
    loanAmount: "400.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.49 FAİZ",
    tag: "Takas Desteği",
    tagColor: "blue",
    perks: [
      "50.000 TL nakit takas teşviki",
      "Anlaşmalı bankalarda %1.49 özel faiz oranı",
      "Envanterden 7 günde hemen teslimat garantisi",
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
    loanAmount: "300.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Şarj Hediyesi",
    tagColor: "purple",
    perks: [
      "300.000 TL için 12 ay %0.99 faizli finansman",
      "1 Yıllık Ücretsiz Eşarj şarj kartı hediyesi",
      "WorldCard sahiplerine özel sigorta indirimi",
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
    loanAmount: "250.000 TL",
    maturity: "12 Ay",
    interestRate: "%0.99 FAİZ",
    tag: "Yeşil Taşıt Kredisi",
    tagColor: "emerald",
    perks: [
      "Çevreci yeşil taşıt kredisi ile %0.99 kâr payı / faiz",
      "EV3 için 20.000 TL takas desteği",
      "5 yıl / 150.000 km araç ve batarya garantisi",
    ],
    vehicleSlug: "kia-ev3-long-range-2026",
    expiryDate: "Güncel",
    type: "green-loan",
  },
  {
    id: "renault-qnb",
    brand: "Renault",
    model: "Megane E-Tech & Kangoo",
    bankPartner: "QNB Finansbank",
    loanAmount: "200.000 TL",
    maturity: "12 Ay",
    interestRate: "%0 FAİZ",
    tag: "0 Faiz + Wallbox",
    tagColor: "emerald",
    perks: [
      "200.000 TL 12 ay %0 faiz kampanyası",
      "Ücretsiz ev tipi 22 kW Akıllı Wallbox kurulumu",
      "KOBİ'lere özel ticari vergi muafiyet paketi",
    ],
    vehicleSlug: "renault-5-e-tech-2026",
    expiryDate: "Ay Sonu",
    type: "zero-interest",
  },
  {
    id: "byd-is-bankasi",
    brand: "BYD",
    model: "Atto 3 & Seal 160 kW",
    bankPartner: "Türkiye İş Bankası",
    loanAmount: "350.000 TL",
    maturity: "12 Ay",
    interestRate: "%1.69 FAİZ",
    tag: "Nakit İndirim",
    tagColor: "amber",
    perks: [
      "100.000 TL'ye varan doğrudan lansman indirimi",
      "İş Bankası Çevreci Taşıt Kredisi avantajı",
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
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      {/* Üst Başlık & Filtreler */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-red-500 border border-neutral-800 shadow-xs">
              <span className="text-[11px] font-black">%</span>
            </div>
            <h2 className="text-base font-black tracking-tight text-neutral-900">
              EV ARAÇ KAMPANYALARI & FİNANSMAN
            </h2>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Türkiye&apos;deki resmî marka ve banka işbirlikleri, sıfır faiz ve yeşil taşıt kredisi fırsatları
          </p>
        </div>

        {/* Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "all"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Tümü ({CAMPAIGNS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("zero-interest")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "zero-interest"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-500 hover:text-red-600"
            }`}
          >
            %0 Faiz Fırsatları
          </button>
          <button
            type="button"
            onClick={() => setFilter("green-loan")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "green-loan"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Yeşil Taşıt Kredileri
          </button>
          <button
            type="button"
            onClick={() => setFilter("trade-in")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "trade-in"
                ? "bg-black text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Takas & İndirim
          </button>
        </div>
      </div>

      {/* Kampanya Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/40 p-4 transition hover:border-red-600/40 hover:bg-white hover:shadow-md"
          >
            <div>
              {/* Üst Rozetler */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-black uppercase text-neutral-800 tracking-wider">
                  {item.brand}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${
                    item.interestRate.includes("0")
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-black text-white"
                  }`}
                >
                  {item.interestRate}
                </span>
              </div>

              {/* Araç Model Başlığı */}
              <h3 className="text-sm font-black text-neutral-900 leading-snug">
                {item.model}
              </h3>

              {/* Banka Partnerliği */}
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-600 font-semibold bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5">
                <span className="text-neutral-500 font-bold">🏛️</span>
                <span className="truncate">{item.bankPartner}</span>
              </div>

              {/* Kredi & Vade Özeti */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-neutral-100/70 p-2">
                  <span className="block text-[9px] font-bold text-neutral-400 uppercase">Kredi Tutarı</span>
                  <span className="text-xs font-black text-neutral-900">{item.loanAmount}</span>
                </div>
                <div className="rounded-lg bg-neutral-100/70 p-2">
                  <span className="block text-[9px] font-bold text-neutral-400 uppercase">Vade</span>
                  <span className="text-xs font-black text-neutral-900">{item.maturity}</span>
                </div>
              </div>

              {/* Maddeler */}
              <ul className="mt-3 space-y-1.5 text-[11px] text-neutral-600">
                {item.perks.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-600 font-bold shrink-0">✓</span>
                    <span className="leading-tight">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alt İşlem Butonu & Geçerlilik */}
            <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                ⏱ {item.expiryDate}
              </span>
              <Link
                href={`/araclar/${item.vehicleSlug}`}
                className="font-bold text-neutral-900 hover:text-red-600 hover:underline flex items-center gap-1 text-[11px] transition"
              >
                Modeli İncele →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Alt Bilgi Uyarısı */}
      <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-neutral-100">
        <span>
          💡 <strong>Resmî Kampanya Bilgisi:</strong> Faiz oranları ve kredi tahsisleri ilgili bankaların ve markaların resmî yetkili satıcı şartlarına bağlıdır.
        </span>
        <Link
          href="/kategori/haber-merkezi"
          className="shrink-0 font-bold text-emerald-700 hover:underline"
        >
          Tüm Finansman Haberleri →
        </Link>
      </div>
    </section>
  );
}
