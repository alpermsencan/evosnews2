"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SalesItem {
  rank: number;
  model: string;
  brand: string;
  salesCount: number;
  marketShare: number;
  change: string;
  slug?: string;
}

const SALES_DATA: SalesItem[] = [
  { rank: 1, brand: "TOGG", model: "T10X", salesCount: 30088, marketShare: 32.5, change: "+14.2%", slug: "togg-t10x-v2-2026" },
  { rank: 2, brand: "Tesla", model: "Model Y", salesCount: 14285, marketShare: 15.5, change: "+8.6%", slug: "tesla-model-y-juniper-2026" },
  { rank: 3, brand: "KGM", model: "Torres EVX", salesCount: 5860, marketShare: 6.3, change: "+24.1%", slug: "dolubatarya-kgm-torres-evx-fed9a6a2" },
  { rank: 4, brand: "BMW", model: "i4 / iX1", salesCount: 4120, marketShare: 4.5, change: "+11.4%", slug: "bmw-i4-edrive40-gran-coupe" },
  { rank: 5, brand: "BYD", model: "Seal / Atto 3", salesCount: 3840, marketShare: 4.2, change: "+38.5%", slug: "byd-seal-160-kw" },
  { rank: 6, brand: "Mercedes", model: "EQE / EQB", salesCount: 3650, marketShare: 3.9, change: "+6.8%", slug: "mercedes-eqe-300" },
  { rank: 7, brand: "Hyundai", model: "Inster / Ioniq 5", salesCount: 3110, marketShare: 3.4, change: "+19.0%", slug: "hyundai-inster" },
  { rank: 8, brand: "Renault", model: "5 / Megane E-Tech", salesCount: 2940, marketShare: 3.2, change: "+15.3%", slug: "renault-5" },
  { rank: 9, brand: "Kia", model: "EV3 / EV6", salesCount: 2450, marketShare: 2.6, change: "+42.0%", slug: "kia-ev3-long-range-2026" },
  { rank: 10, brand: "Volvo", model: "EX30 / EC40", salesCount: 2180, marketShare: 2.4, change: "+18.2%", slug: "volvo-ex30-extended-range-2026" },
];

export default function TurkeyEvSalesWidget() {
  const [activeTab, setActiveTab] = useState<"ranking" | "stats">("ranking");
  const [showAll, setShowAll] = useState(false);

  const displayedList = showAll ? SALES_DATA : SALES_DATA.slice(0, 6);

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2.5 border-b border-neutral-150 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-600" />
            </div>
            <div>
              <h3 className="text-xs font-black text-neutral-950 tracking-tight flex items-center gap-1.5 uppercase">
                <span>TÜRKİYE EV SATIŞLARI</span>
                <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded-full font-black">
                  ODMD
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium">
                2026 Resmî Kümülatif Pazar Raporu
              </p>
            </div>
          </div>

          {/* Tab Seçimi */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("ranking")}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === "ranking"
                  ? "bg-neutral-950 text-white shadow-xs font-bold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Liderler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === "stats"
                  ? "bg-neutral-950 text-white shadow-xs font-bold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Analiz
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 Özet İstatistik Kartları (Taşma Yapmayan Grid) */}
      <div className="grid grid-cols-2 gap-2 py-3 border-b border-neutral-100">
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-150">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Toplam Tescil</span>
          <span className="text-sm font-black text-neutral-950 tracking-tight mt-0.5">92.420 adet</span>
          <span className="text-[10px] text-red-600 font-black">+%64.2 Yıllık</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-150">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Pazar Payı</span>
          <span className="text-sm font-black text-neutral-950 tracking-tight mt-0.5">%10.4</span>
          <span className="text-[10px] text-neutral-500 font-semibold">Tüm Otomobiller</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-150">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Pazar Lideri</span>
          <span className="text-sm font-black text-neutral-950 tracking-tight mt-0.5 truncate">TOGG T10X</span>
          <span className="text-[10px] text-red-600 font-black">%32.5 Pay</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-150">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">En Hızlı Artan</span>
          <span className="text-sm font-black text-neutral-950 tracking-tight mt-0.5 truncate">Kia EV Serisi</span>
          <span className="text-[10px] text-emerald-600 font-black">+%42.0 Trend</span>
        </div>
      </div>

      {/* Model Satış Listesi (Sütun Taşmalarından Arındırılmış Modern Satır Tasarımı) */}
      {activeTab === "ranking" ? (
        <div className="flex flex-col divide-y divide-neutral-100 text-xs mt-1">
          {displayedList.map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between py-2.5 px-1 hover:bg-neutral-50/80 transition rounded-lg"
            >
              {/* Sol: Sıralama + Model + İlerleme Çubuğu */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black shrink-0 ${
                    item.rank === 1
                      ? "bg-red-600 text-white shadow-2xs"
                      : item.rank === 2
                      ? "bg-neutral-900 text-white"
                      : item.rank === 3
                      ? "bg-neutral-200 text-neutral-800"
                      : "bg-neutral-100 text-neutral-500 font-bold"
                  }`}
                >
                  {item.rank}
                </span>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="truncate">
                    {item.slug ? (
                      <Link
                        href={`/araclar/${item.slug}`}
                        className="font-bold text-neutral-950 hover:text-red-600 transition"
                      >
                        <span className="font-black text-neutral-900">{item.brand}</span>{" "}
                        <span className="text-neutral-600 font-medium">{item.model}</span>
                      </Link>
                    ) : (
                      <span className="font-bold text-neutral-950">
                        {item.brand} {item.model}
                      </span>
                    )}
                  </div>

                  {/* Pazar Payı Çubuğu */}
                  <div className="w-full max-w-[140px] bg-neutral-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.rank === 1 ? "bg-red-600" : "bg-neutral-800"
                      }`}
                      style={{ width: `${Math.min(100, item.marketShare * 2.8)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sağ: Adet + Pay & Trend (Taşmayan, 2 Satırlı Net Format) */}
              <div className="flex flex-col items-end shrink-0 pl-1">
                <span className="font-black text-neutral-950 text-xs tracking-tight">
                  {item.salesCount.toLocaleString("tr-TR")} adet
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5">
                  <span className="text-neutral-500">%{item.marketShare}</span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-emerald-600 font-black">{item.change}</span>
                </div>
              </div>
            </div>
          ))}

          {/* İlk 10 Genişlet / Daralt Butonu */}
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-center text-[11px] font-bold text-neutral-500 hover:text-red-600 transition bg-neutral-50 hover:bg-neutral-100 rounded-lg mt-2"
          >
            {showAll ? "▲ İlk 6 Modeli Göster" : `▼ Tüm İlk 10 Modeli Göster (${SALES_DATA.length})`}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 py-3 text-xs leading-relaxed text-neutral-600">
          <p className="text-[11px] text-neutral-600">
            ODMD resmî verilerine göre, elektrikli otomobil pazarı son bir yılda <strong>%64,2</strong> büyüyerek toplam pazarın <strong>%10,4</strong>&apos;üne ulaştı.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between font-bold">
              <span className="text-neutral-500">Yerli Üretim (TOGG):</span>
              <span className="text-red-600 font-black">%32,5 Pay</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-neutral-500">İthal Elektrikli Payı:</span>
              <span className="text-neutral-900 font-black">%67,5 Pay</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-neutral-500">En Çok Tercih Edilen:</span>
              <span className="text-neutral-900 font-black">C-SUV & B-SUV</span>
            </div>
          </div>
        </div>
      )}

      {/* Alt Bilgi & Tümünü İncele Linki */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-[10px] text-neutral-400">Kaynak: ODMD Resmî</span>
        <Link
          href="/araclar"
          className="text-neutral-900 hover:text-red-600 font-black text-[11px] transition flex items-center gap-1"
        >
          <span>Modelleri Keşfet</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
