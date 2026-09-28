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
    <div className="flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-neutral-150 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-950 tracking-tight flex items-center gap-2">
              <span>TÜRKİYE ELEKTRİKLİ ARAÇ SATIŞLARI</span>
              <span className="text-[10px] bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded-full font-black">
                ODMD Resmî
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Otomotiv Distribütörleri ve Mobilite Derneği Resmî Pazar Raporu
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
                ? "bg-neutral-950 text-white shadow-xs font-bold"
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
                ? "bg-neutral-950 text-white shadow-xs font-bold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Pazar Analizi
          </button>
        </div>
      </div>

      {/* Stats Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-neutral-100">
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50 border border-neutral-150">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Toplam EV Tescil</span>
          <span className="text-base font-black text-neutral-950 tracking-tight mt-0.5">92.420 adet</span>
          <span className="text-[10px] text-red-600 font-black">+%64.2 Yıllık</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50 border border-neutral-150">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">EV Pazar Payı</span>
          <span className="text-base font-black text-neutral-950 tracking-tight mt-0.5">%10.4</span>
          <span className="text-[10px] text-neutral-500 font-semibold">Toplam Otomobil</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50 border border-neutral-150">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Pazar Lideri</span>
          <span className="text-base font-black text-neutral-950 tracking-tight mt-0.5">TOGG T10X</span>
          <span className="text-[10px] text-red-600 font-black">%32.5 Pay</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-xl bg-neutral-50 border border-neutral-150">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">En Yüksek Artış</span>
          <span className="text-base font-black text-neutral-950 tracking-tight mt-0.5">Kia EV Serisi</span>
          <span className="text-[10px] text-red-600 font-black">+%42.0 Trend</span>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === "ranking" ? (
        <div className="flex flex-col divide-y divide-neutral-100 text-xs mt-1">
          <div className="grid grid-cols-12 py-2 font-black text-neutral-400 text-[10px] uppercase tracking-wider">
            <span className="col-span-1 text-center">Sıra</span>
            <span className="col-span-5">Model / Marka</span>
            <span className="col-span-2 text-right">Adet</span>
            <span className="col-span-2 text-right">Pay</span>
            <span className="col-span-2 text-right">Büyüme</span>
          </div>

          {SALES_DATA.slice(0, 8).map((item) => (
            <div
              key={item.rank}
              className="grid grid-cols-12 items-center py-2.5 hover:bg-neutral-50/80 transition rounded-lg px-1.5"
            >
              {/* Rank Podiums */}
              <div className="col-span-1 flex justify-center">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black ${
                  item.rank === 1
                    ? "bg-red-600 text-white shadow-xs"
                    : item.rank === 2
                    ? "bg-neutral-950 text-white"
                    : item.rank === 3
                    ? "bg-neutral-200 text-neutral-800"
                    : "text-neutral-500 font-bold"
                }`}>
                  {item.rank}
                </span>
              </div>

              {/* Model */}
              <div className="col-span-5 flex flex-col min-w-0 pr-2">
                {item.slug ? (
                  <Link
                    href={`/araclar/${item.slug}`}
                    className="font-bold text-neutral-950 hover:text-red-600 transition truncate"
                  >
                    <span className="font-black text-neutral-950">{item.brand}</span>{" "}
                    <span className="text-neutral-600">{item.model}</span>
                  </Link>
                ) : (
                  <span className="font-bold text-neutral-950 truncate">
                    {item.brand} {item.model}
                  </span>
                )}
                {/* Visual Progress Bar */}
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.rank === 1 ? "bg-red-600" : "bg-neutral-900"
                    }`}
                    style={{ width: `${Math.min(100, item.marketShare * 2.8)}%` }}
                  />
                </div>
              </div>

              {/* Sales Count */}
              <span className="col-span-2 text-right font-black text-neutral-950">
                {item.salesCount.toLocaleString("tr-TR")}
              </span>

              {/* Market Share */}
              <span className="col-span-2 text-right font-bold text-neutral-700">
                %{item.marketShare}
              </span>

              {/* Trend */}
              <span className="col-span-2 text-right font-black text-red-600">
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
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150 flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between font-bold">
              <span className="text-neutral-600">Yerli Üretim Payı (TOGG):</span>
              <span className="text-red-600 font-black">%32,5</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-neutral-600">İthal Elektrikli Payı:</span>
              <span className="text-neutral-950 font-black">%67,5</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-neutral-600">En Çok Tercih Edilen Kasa:</span>
              <span className="text-neutral-950 font-black">C-SUV &amp; B-SUV (%78)</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer link */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-neutral-400">Kaynak: ODMD Resmî Tescil Veritabanı</span>
        <Link
          href="/araclar"
          className="text-neutral-900 hover:text-red-600 font-black transition flex items-center gap-1"
        >
          <span>Tüm Modelleri İncele</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
