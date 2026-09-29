"use client";

import React, { useState } from "react";

export type PartStatus = "ORIJINAL" | "BOYALI" | "DEGISEN" | "SOKTAK" | "LOKAL";

export interface ExpertiseData {
  kaput?: PartStatus;
  tavan?: PartStatus;
  bagaj?: PartStatus;
  onTampon?: PartStatus;
  arkaTampon?: PartStatus;
  solOnCamurluk?: PartStatus;
  sagOnCamurluk?: PartStatus;
  solArkaCamurluk?: PartStatus;
  sagArkaCamurluk?: PartStatus;
  solOnKapi?: PartStatus;
  solArkaKapi?: PartStatus;
  sagOnKapi?: PartStatus;
  sagArkaKapi?: PartStatus;
  [key: string]: PartStatus | undefined;
}

export const STATUS_CONFIG: Record<
  PartStatus,
  { label: string; color: string; fill: string; stroke: string; badgeClass: string }
> = {
  ORIJINAL: {
    label: "Orijinal",
    color: "#10B981", // Emerald
    fill: "#10B981",
    stroke: "#059669",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  BOYALI: {
    label: "Boyalı",
    color: "#F59E0B", // Amber
    fill: "#F59E0B",
    stroke: "#D97706",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DEGISEN: {
    label: "Değişen",
    color: "#EF4444", // Red
    fill: "#EF4444",
    stroke: "#DC2626",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  SOKTAK: {
    label: "Sök-Tak",
    color: "#3B82F6", // Blue
    fill: "#3B82F6",
    stroke: "#2563EB",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  LOKAL: {
    label: "Lokal Boyalı",
    color: "#F97316", // Orange
    fill: "#F97316",
    stroke: "#EA580C",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const PARTS_LIST: { id: keyof ExpertiseData; label: string; area: string }[] = [
  { id: "onTampon", label: "Ön Tampon", area: "Ön" },
  { id: "kaput", label: "Ön Kaput", area: "Ön" },
  { id: "solOnCamurluk", label: "Sol Ön Çamurluk", area: "Sol" },
  { id: "sagOnCamurluk", label: "Sağ Ön Çamurluk", area: "Sağ" },
  { id: "solOnKapi", label: "Sol Ön Kapı", area: "Sol" },
  { id: "sagOnKapi", label: "Sağ Ön Kapı", area: "Sağ" },
  { id: "tavan", label: "Tavan", area: "Orta" },
  { id: "solArkaKapi", label: "Sol Arka Kapı", area: "Sol" },
  { id: "sagArkaKapi", label: "Sağ Arka Kapı", area: "Sağ" },
  { id: "solArkaCamurluk", label: "Sol Arka Çamurluk", area: "Sol" },
  { id: "sagArkaCamurluk", label: "Sağ Arka Çamurluk", area: "Sağ" },
  { id: "bagaj", label: "Bagaj Kapağı", area: "Arka" },
  { id: "arkaTampon", label: "Arka Tampon", area: "Arka" },
];

const CYCLE_ORDER: PartStatus[] = ["ORIJINAL", "BOYALI", "DEGISEN", "SOKTAK", "LOKAL"];

interface CarDamageReportProps {
  value?: ExpertiseData | null;
  onChange?: (val: ExpertiseData) => void;
  editable?: boolean;
}

export default function CarDamageReport({
  value,
  onChange,
  editable = false,
}: CarDamageReportProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<string>("kaput");

  // Varsayılan olarak tüm parçalar ORIJINAL kabul edilir
  const data: ExpertiseData = {
    onTampon: "ORIJINAL",
    kaput: "ORIJINAL",
    solOnCamurluk: "ORIJINAL",
    sagOnCamurluk: "ORIJINAL",
    solOnKapi: "ORIJINAL",
    sagOnKapi: "ORIJINAL",
    tavan: "ORIJINAL",
    solArkaKapi: "ORIJINAL",
    sagArkaKapi: "ORIJINAL",
    solArkaCamurluk: "ORIJINAL",
    sagArkaCamurluk: "ORIJINAL",
    bagaj: "ORIJINAL",
    arkaTampon: "ORIJINAL",
    ...(value || {}),
  };

  const getStatus = (id: keyof ExpertiseData): PartStatus => data[id] || "ORIJINAL";

  const handlePartClick = (id: keyof ExpertiseData) => {
    if (!editable || !onChange) return;
    setSelectedPart(id as string);
    const current = getStatus(id);
    const nextIdx = (CYCLE_ORDER.indexOf(current) + 1) % CYCLE_ORDER.length;
    onChange({
      ...data,
      [id]: CYCLE_ORDER[nextIdx],
    });
  };

  const setPartStatusExplicit = (status: PartStatus) => {
    if (!editable || !onChange || !selectedPart) return;
    onChange({
      ...data,
      [selectedPart]: status,
    });
  };

  // İstatistiksel Özet
  const counts = Object.values(data).reduce(
    (acc, cur) => {
      const s = cur || "ORIJINAL";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<PartStatus, number>
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>Araç Ekspertiz &amp; Kaporta Durumu</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {editable
              ? "Aşağıdaki araç şemasında parçalara tıklayarak veya seçerek durumlarını (boyalı, değişen, söktak, orijinal) belirleyin."
              : "Aracın kuşbakışı kaporta hasar ve boya durumu şeması."}
          </p>
        </div>

        {/* Lejant (Renk Anlamları) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black">
          {CYCLE_ORDER.map((st) => (
            <div
              key={st}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 border ${STATUS_CONFIG[st].badgeClass}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_CONFIG[st].color }}
              />
              <span>{STATUS_CONFIG[st].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Şema ve Parça Seçici Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Sol Kolon: Üstten Görünüm Vektörel Araç Şeması */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-2 sm:p-4 bg-neutral-950 rounded-2xl relative shadow-inner">
          <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-2">
            ÖN (FRONT)
          </span>

          <svg
            viewBox="0 0 280 500"
            className="w-full max-w-[240px] h-auto select-none drop-shadow-2xl"
          >
            <defs>
              {/* Araba gövde ana hatları */}
              <filter id="carGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Ön Tampon */}
            <path
              d="M 60 45 C 90 20 190 20 220 45 L 210 65 C 180 48 100 48 70 65 Z"
              fill={STATUS_CONFIG[getStatus("onTampon")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "onTampon" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("onTampon")}
              onMouseEnter={() => setHoveredPart("onTampon")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Kaput */}
            <path
              d="M 72 70 C 100 55 180 55 208 70 L 212 165 C 175 160 105 160 68 165 Z"
              fill={STATUS_CONFIG[getStatus("kaput")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "kaput" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("kaput")}
              onMouseEnter={() => setHoveredPart("kaput")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sol Ön Çamurluk */}
            <path
              d="M 45 60 L 68 70 L 64 165 L 35 155 C 32 120 32 90 45 60 Z"
              fill={STATUS_CONFIG[getStatus("solOnCamurluk")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "solOnCamurluk" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("solOnCamurluk")}
              onMouseEnter={() => setHoveredPart("solOnCamurluk")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sağ Ön Çamurluk */}
            <path
              d="M 235 60 L 212 70 L 216 165 L 245 155 C 248 120 248 90 235 60 Z"
              fill={STATUS_CONFIG[getStatus("sagOnCamurluk")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "sagOnCamurluk" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("sagOnCamurluk")}
              onMouseEnter={() => setHoveredPart("sagOnCamurluk")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Ön Cam (Dekoratif) */}
            <path
              d="M 72 170 C 105 165 175 165 208 170 L 202 215 C 165 210 115 210 78 215 Z"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Sol Ön Kapı */}
            <path
              d="M 34 165 L 75 172 L 75 250 L 32 250 Z"
              fill={STATUS_CONFIG[getStatus("solOnKapi")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "solOnKapi" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("solOnKapi")}
              onMouseEnter={() => setHoveredPart("solOnKapi")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sağ Ön Kapı */}
            <path
              d="M 246 165 L 205 172 L 205 250 L 248 250 Z"
              fill={STATUS_CONFIG[getStatus("sagOnKapi")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "sagOnKapi" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("sagOnKapi")}
              onMouseEnter={() => setHoveredPart("sagOnKapi")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Tavan */}
            <path
              d="M 80 220 C 115 215 165 215 200 220 L 195 330 C 160 335 120 335 85 330 Z"
              fill={STATUS_CONFIG[getStatus("tavan")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "tavan" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("tavan")}
              onMouseEnter={() => setHoveredPart("tavan")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sol Arka Kapı */}
            <path
              d="M 32 255 L 75 255 L 75 335 L 34 330 Z"
              fill={STATUS_CONFIG[getStatus("solArkaKapi")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "solArkaKapi" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("solArkaKapi")}
              onMouseEnter={() => setHoveredPart("solArkaKapi")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sağ Arka Kapı */}
            <path
              d="M 248 255 L 205 255 L 205 335 L 246 330 Z"
              fill={STATUS_CONFIG[getStatus("sagArkaKapi")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "sagArkaKapi" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("sagArkaKapi")}
              onMouseEnter={() => setHoveredPart("sagArkaKapi")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Arka Cam (Dekoratif) */}
            <path
              d="M 85 335 C 120 340 160 340 195 335 L 198 375 C 160 378 120 378 82 375 Z"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Sol Arka Çamurluk */}
            <path
              d="M 34 335 L 76 340 L 70 435 L 45 430 C 33 400 32 370 34 335 Z"
              fill={STATUS_CONFIG[getStatus("solArkaCamurluk")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "solArkaCamurluk" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("solArkaCamurluk")}
              onMouseEnter={() => setHoveredPart("solArkaCamurluk")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Sağ Arka Çamurluk */}
            <path
              d="M 246 335 L 204 340 L 210 435 L 235 430 C 247 400 248 370 246 335 Z"
              fill={STATUS_CONFIG[getStatus("sagArkaCamurluk")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "sagArkaCamurluk" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("sagArkaCamurluk")}
              onMouseEnter={() => setHoveredPart("sagArkaCamurluk")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Bagaj Kapağı */}
            <path
              d="M 82 380 C 120 382 160 382 198 380 L 192 445 C 160 450 120 450 88 445 Z"
              fill={STATUS_CONFIG[getStatus("bagaj")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "bagaj" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("bagaj")}
              onMouseEnter={() => setHoveredPart("bagaj")}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Arka Tampon */}
            <path
              d="M 60 455 C 90 475 190 475 220 455 L 215 440 C 185 450 95 450 65 440 Z"
              fill={STATUS_CONFIG[getStatus("arkaTampon")].fill}
              stroke="#1E293B"
              strokeWidth="2"
              className={`transition-all duration-200 cursor-pointer ${
                editable ? "hover:opacity-85 hover:stroke-white" : ""
              } ${selectedPart === "arkaTampon" ? "stroke-white stroke-[3px]" : ""}`}
              onClick={() => handlePartClick("arkaTampon")}
              onMouseEnter={() => setHoveredPart("arkaTampon")}
              onMouseLeave={() => setHoveredPart(null)}
            />
          </svg>

          <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500 mt-2">
            ARKA (REAR)
          </span>
        </div>

        {/* Sağ Kolon: Parça Listesi & Durum Seçicisi */}
        <div className="md:col-span-6 flex flex-col gap-3">
          {/* Düzenleme Aracı: Seçili Parçanın Durumunu Değiştir */}
          {editable && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-800">
                  Seçili:{" "}
                  <strong className="text-blue-600">
                    {PARTS_LIST.find((p) => p.id === selectedPart)?.label}
                  </strong>
                </span>
                <span className="text-[10px] font-bold text-neutral-400">
                  (Değiştirmek için tıkla)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CYCLE_ORDER.map((st) => {
                  const isCurrent = getStatus(selectedPart) === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setPartStatusExplicit(st)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-black border transition ${
                        isCurrent
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                          : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                      }`}
                    >
                      {STATUS_CONFIG[st].label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* İstatistiksel Durum Sayaçları */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
            {CYCLE_ORDER.map((st) => (
              <div
                key={st}
                className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-2 flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-neutral-500 uppercase truncate">
                  {STATUS_CONFIG[st].label}
                </span>
                <span
                  className="text-sm font-black mt-0.5"
                  style={{ color: STATUS_CONFIG[st].color }}
                >
                  {counts[st] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* 13 Parçanın Liste Görünümü */}
          <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-neutral-100 text-xs">
            {PARTS_LIST.map((p) => {
              const status = getStatus(p.id);
              const isSelected = selectedPart === p.id;
              const isHovered = hoveredPart === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handlePartClick(p.id)}
                  onMouseEnter={() => setHoveredPart(p.id as string)}
                  onMouseLeave={() => setHoveredPart(null)}
                  className={`flex items-center justify-between p-2.5 transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 font-bold"
                      : isHovered
                      ? "bg-neutral-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_CONFIG[status].color }}
                    />
                    <span className="text-neutral-800 font-semibold">{p.label}</span>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[status].badgeClass}`}
                  >
                    {STATUS_CONFIG[status].label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
