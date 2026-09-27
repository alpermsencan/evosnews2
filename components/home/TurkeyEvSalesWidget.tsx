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
  { rank: 4, brand: "BMW", model: "iX1 / i4", salesCount: 4120, marketShare: 4.5, change: "+11.4%", slug: "bmw-i4-edrive40-gran-coupe" },
  { rank: 5, brand: "BYD", model: "Atto 3 / Seal", salesCount: 3840, marketShare: 4.2, change: "+38.5%", slug: "byd-seal-160-kw" },
  { rank: 6, brand: "Mercedes-Benz", model: "EQB / EQE", salesCount: 3650, marketShare: 3.9, change: "+6.8%", slug: "mercedes-eqe-300" },
  { rank: 7, brand: "Hyundai", model: "Ioniq 5 / Inster", salesCount: 3110, marketShare: 3.4, change: "+19.0%", slug: "hyundai-inster" },
  { rank: 8, brand: "Renault", model: "Megane / Scenic E-Tech", salesCount: 2940, marketShare: 3.2, change: "+15.3%", slug: "renault-5-e-tech-2026" },
  { rank: 9, brand: "Kia", model: "EV3 / EV6 / EV9", salesCount: 2450, marketShare: 2.6, change: "+42.0%", slug: "kia-ev3-long-range-2026" },
  { rank: 10, brand: "Volvo", model: "EX30 / EX40", salesCount: 2180, marketShare: 2.4, change: "+18.2%", slug: "volvo-ex30-extended-range-2026" },
];

export default function TurkeyEvSalesWidget() {
  const [activeTab, setActiveTab] = useState<"ranking" | "stats">("ranking");

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-150 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-red-500 border border-neutral-800 shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 20V10M12 20V4M6 20V14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>TÜRKİYE ELEKTRİKLİ ARAÇ SATIŞLARI</span>
              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">
                ODMD Resmî
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Otomotiv Distribütörleri ve Mobilite Derneği Tescil Verileri
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ranking")}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === "ranking"
                ? "bg-black text-white shadow-xs font-bold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Lider Modeller
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === "stats"
                ? "bg-black text-white shadow-xs font-bold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Pazar Özeti
          </button>
        </div>
      </div>

      {/* Stats Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-neutral-100">
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Toplam EV Tescil</span>
          <span className="text-base font-black text-neutral-900 tracking-tight">92.420 adet</span>
          <span className="text-[10px] text-red-600 font-bold">+%64.2 Yıllık</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">EV Pazar Payı</span>
          <span className="text-base font-black text-neutral-900 tracking-tight">%10.4</span>
          <span className="text-[10px] text-neutral-500 font-medium">Toplam Otomobil</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Pazar Lideri</span>
          <span className="text-base font-black text-neutral-900 tracking-tight">TOGG T10X</span>
          <span className="text-[10px] text-neutral-500 font-medium">%32.5 Pazar Payı</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">En Hızlı Büyüyen</span>
          <span className="text-base font-black text-neutral-900 tracking-tight">Kia EV Serisi</span>
          <span className="text-[10px] text-red-600 font-bold">+%42.0 Artış</span>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === "ranking" ? (
        <div className="flex flex-col divide-y divide-neutral-100 text-xs mt-1">
          <div className="grid grid-cols-12 py-2 font-bold text-neutral-400 text-[10px] uppercase">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-5">Model</span>
            <span className="col-span-2 text-right">Adet</span>
            <span className="col-span-2 text-right">Pay</span>
            <span className="col-span-2 text-right">Trend</span>
          </div>

          {SALES_DATA.slice(0, 7).map((item) => (
            <div
              key={item.rank}
              className="grid grid-cols-12 items-center py-2.5 hover:bg-neutral-50 transition rounded-lg px-1"
            >
              {/* Rank */}
              <span className={`col-span-1 text-center font-black ${
                item.rank === 1
                  ? "text-red-600 font-black"
                  : item.rank === 2
                  ? "text-neutral-700 font-bold"
                  : item.rank === 3
                  ? "text-neutral-600 font-bold"
                  : "text-neutral-400"
              }`}>
                {item.rank}
              </span>

              {/* Model */}
              <div className="col-span-5 flex flex-col min-w-0 pr-2">
                {item.slug ? (
                  <Link
                    href={`/araclar/${item.slug}`}
                    className="font-bold text-neutral-900 hover:text-red-600 transition truncate"
                  >
                    <span className="font-black text-neutral-900">{item.brand}</span>{" "}
                    <span className="text-neutral-600">{item.model}</span>
                  </Link>
                ) : (
                  <span className="font-bold text-neutral-900 truncate">
                    {item.brand} {item.model}
                  </span>
                )}
                {/* Mini Progress Bar */}
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.marketShare * 2.8)}%` }}
                  />
                </div>
              </div>

              {/* Sales Count */}
              <span className="col-span-2 text-right font-black text-neutral-900">
                {item.salesCount.toLocaleString("tr-TR")}
              </span>

              {/* Market Share */}
              <span className="col-span-2 text-right font-semibold text-neutral-600">
                %{item.marketShare}
              </span>

              {/* Trend */}
              <span className="col-span-2 text-right font-bold text-emerald-600">
                {item.change}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 py-3 text-xs leading-relaxed text-neutral-600">
          <p>
            Otomotiv Distribütörleri ve Mobilite Derneği (ODMD) resmî raporuna göre, Türkiye elektrikli otomobil pazarı son bir yılda <strong>%64,2</strong> büyüme kaydederek 92 bin adedin üzerine çıktı.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>Yerli Üretim Payı (TOGG):</span>
              <span className="text-emerald-600 font-black">%32,5</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>İthal Elektrikli Payı:</span>
              <span className="text-neutral-800 font-black">%67,5</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>En Çok Tercih Edilen Kasa:</span>
              <span className="text-neutral-800 font-black">C-SUV &amp; B-SUV (%78)</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer link */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-neutral-400">Kaynak: ODMD / Otomotiv Tescil Raporu</span>
        <Link
          href="/araclar"
          className="text-emerald-600 hover:text-emerald-700 font-bold transition flex items-center gap-1"
        >
          <span>Tüm Modelleri İncele</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
