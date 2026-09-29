"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SalesItem {
  rank: number;
  model: string;
  brand: string;
  brandBadgeBg: string;
  brandBadgeColor: string;
  modelImage: string;
  salesCount: number;
  marketShare: number;
  change: string;
  slug?: string;
}

const SALES_DATA: SalesItem[] = [
  {
    rank: 1,
    brand: "TOGG",
    brandBadgeBg: "bg-[#00A3E0]",
    brandBadgeColor: "text-white",
    model: "T10X V2",
    modelImage: "https://dolubatarya.com/uploads/2021/12/2023-togg-t10x-ozellikler-teknik.jpg",
    salesCount: 30088,
    marketShare: 32.5,
    change: "+14.2%",
    slug: "togg-t10x-v2-2026",
  },
  {
    rank: 2,
    brand: "TESLA",
    brandBadgeBg: "bg-[#E82127]",
    brandBadgeColor: "text-white",
    model: "Model Y",
    modelImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&auto=format&fit=crop",
    salesCount: 14285,
    marketShare: 15.5,
    change: "+8.6%",
    slug: "tesla-model-y-juniper-2026",
  },
  {
    rank: 3,
    brand: "KGM",
    brandBadgeBg: "bg-[#002C6C]",
    brandBadgeColor: "text-white",
    model: "Torres EVX",
    modelImage: "https://dolubatarya.com/uploads/2023/11/kgm-torres-evx-turkiye-fiyati-3819.jpg",
    salesCount: 5860,
    marketShare: 6.3,
    change: "+24.1%",
    slug: "dolubatarya-kgm-torres-evx-fed9a6a2",
  },
  {
    rank: 4,
    brand: "BMW",
    brandBadgeBg: "bg-[#0066B1]",
    brandBadgeColor: "text-white",
    model: "i4 / iX1",
    modelImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&auto=format&fit=crop",
    salesCount: 4120,
    marketShare: 4.5,
    change: "+11.4%",
    slug: "bmw-i4-edrive40-gran-coupe",
  },
  {
    rank: 5,
    brand: "BYD",
    brandBadgeBg: "bg-[#1B365D]",
    brandBadgeColor: "text-white",
    model: "Seal / Atto 3",
    modelImage: "https://dolubatarya.com/uploads/2025/07/byd-seal-160-kw-2792.webp",
    salesCount: 3840,
    marketShare: 4.2,
    change: "+38.5%",
    slug: "byd-seal-160-kw",
  },
  {
    rank: 6,
    brand: "MERCEDES",
    brandBadgeBg: "bg-neutral-950",
    brandBadgeColor: "text-white",
    model: "EQE / EQB",
    modelImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&auto=format&fit=crop",
    salesCount: 3650,
    marketShare: 3.9,
    change: "+6.8%",
    slug: "mercedes-eqe-300",
  },
  {
    rank: 7,
    brand: "HYUNDAI",
    brandBadgeBg: "bg-[#002C6C]",
    brandBadgeColor: "text-white",
    model: "Inster / Ioniq 5",
    modelImage: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
    salesCount: 3110,
    marketShare: 3.4,
    change: "+19.0%",
    slug: "hyundai-inster",
  },
  {
    rank: 8,
    brand: "RENAULT",
    brandBadgeBg: "bg-[#FFCC00]",
    brandBadgeColor: "text-neutral-950",
    model: "5 / Megane",
    modelImage: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/new-editorial/megane-bcb-overview-001-desktop.jpg.ximg.large.webp/faac0803d5.webp",
    salesCount: 2940,
    marketShare: 3.2,
    change: "+15.3%",
    slug: "renault-5",
  },
  {
    rank: 9,
    brand: "KIA",
    brandBadgeBg: "bg-black",
    brandBadgeColor: "text-white",
    model: "EV3 / EV6",
    modelImage: "https://dolubatarya.com/uploads/2025/02/kia-ev4-saloon-standard-range-3182.jpeg",
    salesCount: 2450,
    marketShare: 2.6,
    change: "+42.0%",
    slug: "kia-ev3-long-range-2026",
  },
  {
    rank: 10,
    brand: "VOLVO",
    brandBadgeBg: "bg-[#003057]",
    brandBadgeColor: "text-white",
    model: "EX30 / EC40",
    modelImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop",
    salesCount: 2180,
    marketShare: 2.4,
    change: "+18.2%",
    slug: "volvo-ex30-extended-range-2026",
  },
];

export default function TurkeyEvSalesWidget() {
  const [activeTab, setActiveTab] = useState<"ranking" | "stats">("ranking");
  const [showAll, setShowAll] = useState(false);

  const displayedList = showAll ? SALES_DATA : SALES_DATA.slice(0, 6);

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-300/80 bg-white p-4 sm:p-5 shadow-sm overflow-hidden ring-1 ring-black/5">
      {/* 1. ÜST BAŞLIK & ODMD ROZETİ */}
      <div className="flex flex-col gap-2.5 border-b border-neutral-200 pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-950 tracking-tight flex items-center gap-2 uppercase">
                <span>TÜRKİYE EV SATIŞLARI</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-md font-black shadow-2xs">
                  ODMD
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
                2026 Resmî Kümülatif Satış Raporu
              </p>
            </div>
          </div>

          {/* Tab Seçici */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-bold border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("ranking")}
              className={`px-3 py-1 rounded-lg transition text-xs ${
                activeTab === "ranking"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Sıralama
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`px-3 py-1 rounded-lg transition text-xs ${
                activeTab === "stats"
                  ? "bg-neutral-950 text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              Pazar Payı
            </button>
          </div>
        </div>
      </div>

      {/* 2. BÜYÜK & KALIN ÖZET METRİK KARTLARI */}
      <div className="grid grid-cols-2 gap-2.5 py-3.5 border-b border-neutral-200">
        <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Toplam EV Satışı</span>
          <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">92.420 adet</span>
          <span className="text-xs text-red-600 font-black mt-0.5">+%64.2 Yıllık</span>
        </div>
        <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">EV Pazar Payı</span>
          <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">%10.4</span>
          <span className="text-xs text-neutral-600 font-bold mt-0.5">Tüm Otomobillerde</span>
        </div>
        <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Pazar Lideri</span>
          <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5 truncate">TOGG T10X</span>
          <span className="text-xs text-red-600 font-black mt-0.5">%32.5 Pay</span>
        </div>
        <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Hızlı Yükselen</span>
          <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5 truncate">Kia EV3</span>
          <span className="text-xs text-emerald-600 font-black mt-0.5">+%42.0 Büyüme</span>
        </div>
      </div>

      {/* 3. İÇERİK: SIRALAMA LİSTESİ VEYA PAZAR PAYI ANALİZİ */}
      {activeTab === "ranking" ? (
        <div className="flex flex-col divide-y divide-neutral-150 py-1">
          {displayedList.map((item) => {
            const isTop3 = item.rank <= 3;
            const rankStyle =
              item.rank === 1
                ? "bg-neutral-950 text-white font-black ring-1 ring-neutral-800"
                : item.rank === 2
                ? "bg-neutral-800 text-white font-black"
                : item.rank === 3
                ? "bg-neutral-700 text-white font-black"
                : "bg-neutral-100 text-neutral-700 font-bold border border-neutral-200";

            return (
              <div
                key={item.rank}
                className="group flex flex-col py-2.5 transition hover:bg-neutral-50/80 rounded-xl px-1.5"
              >
                {/* Üst Satır: Sıra + Marka Logosu + Araç Resmi + Model Adı ve Satış */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Sıra Numarası */}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs shadow-2xs ${rankStyle}`}
                    >
                      {item.rank}
                    </span>

                    {/* Marka Logosu Rozeti */}
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 shadow-2xs ${item.brandBadgeBg} ${item.brandBadgeColor}`}
                    >
                      {item.brand}
                    </span>

                    {/* Küçük Model Görseli */}
                    <div className="relative h-7 w-10 sm:h-8 sm:w-12 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 shadow-2xs group-hover:border-neutral-400 transition">
                      <img
                        src={item.modelImage}
                        alt={`${item.brand} ${item.model}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Model İsmi */}
                    <div className="flex items-baseline min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/araclar/${item.slug}`}
                          className="text-[12px] sm:text-[13px] font-black text-neutral-950 group-hover:text-red-600 transition truncate"
                          title={`${item.brand} ${item.model} detay sayfasını incele`}
                        >
                          {item.model}
                        </Link>
                      ) : (
                        <span className="text-[12px] sm:text-[13px] font-black text-neutral-950 truncate">
                          {item.model}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sağ Taraf: Büyük Satış Rakamı & Büyüme Oranı */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs sm:text-sm font-black text-neutral-950 tracking-tight">
                      {item.salesCount.toLocaleString("tr-TR")}{" "}
                      <span className="text-[10px] font-bold text-neutral-500">adet</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span className="text-neutral-500">%{item.marketShare}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-red-600 font-black">{item.change}</span>
                    </div>
                  </div>
                </div>

                {/* Alt Satır: Modern Pazar Payı İlerleme Çubuğu */}
                <div className="mt-2 flex items-center gap-2 pl-8">
                  <div className="h-1.5 flex-1 rounded-full bg-neutral-150 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop3
                          ? "bg-gradient-to-r from-red-600 to-red-500"
                          : "bg-neutral-800"
                      }`}
                      style={{ width: `${Math.min(100, item.marketShare * 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PAZAR ANALİZİ SEKMESİ */
        <div className="flex flex-col gap-3 py-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 flex flex-col gap-2">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
              Segment Dağılımı (2026)
            </h4>
            <div className="flex flex-col gap-2 pt-1">
              <div>
                <div className="flex justify-between text-xs font-black text-neutral-800 mb-1">
                  <span>C-SUV Segmenti</span>
                  <span>%58.4</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full w-[58.4%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black text-neutral-800 mb-1">
                  <span>D-SUV &amp; Sedan</span>
                  <span>%22.1</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-neutral-900 rounded-full w-[22.1%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black text-neutral-800 mb-1">
                  <span>B-SUV &amp; Şehir İçi</span>
                  <span>%19.5</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-neutral-500 rounded-full w-[19.5%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-700">
            <strong className="text-neutral-950 font-black">Önemli Trend:</strong> Yerli üretici TOGG pazarın yaklaşık üçte birini domine ederken, Tesla Model Y ve KGM Torres EVX güçlü yükselişini sürdürüyor.
          </div>
        </div>
      )}

      {/* 4. TÜMÜNÜ GÖSTER / GİZLE BUTONU */}
      {activeTab === "ranking" && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-black text-neutral-800 hover:bg-neutral-950 hover:text-white transition shadow-2xs flex items-center justify-center gap-1.5"
        >
          <span>{showAll ? "İlk 6 Modeli Göster ↑" : "Tüm İlk 10 Modeli Listele ↓"}</span>
        </button>
      )}

      {/* Dipnot */}
      <div className="mt-3 pt-2.5 border-t border-neutral-150 flex items-center justify-between text-[11px] text-neutral-500 font-semibold">
        <span>Kaynak: ODMD Resmî Kayıtları</span>
        <Link href="/araclar" className="text-red-600 font-black hover:underline">
          Modelleri Keşfet →
        </Link>
      </div>
    </div>
  );
}
