"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Modern, kurumsal ve aerodinamik elektrikli araç kasa tipleri & hassas vektörel silüetleri
const BODY_TYPES = [
  {
    id: "suv",
    name: "SUV / Crossover",
    value: "SUV",
    match: ["SUV", "Crossover", "Arazi"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tavan Çıtası */}
        <line x1="20" y1="5" x2="35" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        {/* Gövde Dış Hatları */}
        <path
          d="M4 19V16.5C4 16.5 6 15 9.5 15H13.5L19 7.5H35.5L42 14.5H49C51.5 14.5 53 16 53 18V20H47.5C47 18 45.2 16.5 43 16.5C40.8 16.5 39 18 38.5 20H20.5C20 18 18.2 16.5 16 16.5C13.8 16.5 12 18 11.5 20H4V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cam Çizgileri */}
        <path d="M20 9.5H27V14.5H15L20 9.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M29 9.5H35L39.5 14.5H29V9.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="16" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="20" r="1.5" fill="currentColor" />
        <circle cx="43" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="43" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "sedan",
    name: "Sedan / Fastback",
    value: "Sedan",
    match: ["Sedan", "Fastback"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gövde Dış Hatları */}
        <path
          d="M3 19V17C3 17 5 15.5 9 15.5H13L21 8.5H34L43 15.5H50.5C52.5 15.5 53.5 16.5 53.5 18V20H48C47.5 18 45.5 16.5 43.5 16.5C41.5 16.5 39.5 18 39 20H20C19.5 18 17.5 16.5 15.5 16.5C13.5 16.5 11.5 18 11 20H3V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cam Çizgileri */}
        <path d="M22 10.5H27V15H16L22 10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M29 10.5H33.5L39.5 15H29V10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="15.5" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="15.5" cy="20" r="1.5" fill="currentColor" />
        <circle cx="43.5" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="43.5" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "hatchback",
    name: "Hatchback / Kompakt",
    value: "Hatchback",
    match: ["Hatchback", "Kompakt"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gövde Dış Hatları */}
        <path
          d="M4 19V16.5C4 16.5 6 15 9.5 15H13.5L19 9H35L39 15H47C49.5 15 50.5 16 50.5 18V20H45.5C45 18 43 16.5 41 16.5C39 16.5 37 18 36.5 20H20.5C20 18 18 16.5 16 16.5C14 16.5 12 18 11.5 20H4V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cam Çizgileri */}
        <path d="M20 10.5H26.5V14.5H15.5L20 10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M28.5 10.5H33.5L36.5 14.5H28.5V10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="16" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="20" r="1.5" fill="currentColor" />
        <circle cx="41" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="41" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "ticari",
    name: "Ticari / Minivan",
    value: "Ticari",
    match: ["Ticari", "Minivan", "Panelvan", "VAN"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gövde Dış Hatları */}
        <path
          d="M4 19V16.5C4 16.5 6 15 9 15H12L15 6H44C46 6 47 7.5 47 9.5V18.5V20H43.5C43 18 41 16.5 39 16.5C37 16.5 35 18 34.5 20H19.5C19 18 17 16.5 15 16.5C13 16.5 11 18 10.5 20H4V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ön ve Yan Camlar */}
        <path d="M16 8H24V14H12.5L16 8Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M26 8H34V14H26V8Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M36 8H43V14H36V8Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="15" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="15" cy="20" r="1.5" fill="currentColor" />
        <circle cx="39" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="39" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "coupe",
    name: "Coupe / Spor",
    value: "Coupe",
    match: ["Coupe", "Cabrio", "Roadster", "Spor"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gövde Dış Hatları */}
        <path
          d="M3 19V17.5C3 17.5 6 16 9.5 16H13L23 9.5H33L43 15.5H51C53 15.5 54 16.5 54 17.5V20H48.5C48 18 46 16.5 44 16.5C42 16.5 40 18 39.5 20H19.5C19 18 17 16.5 15 16.5C13 16.5 11 18 10.5 20H3V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cam Çizgisi */}
        <path d="M24 11H31L39 15H17L24 11Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="15" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="15" cy="20" r="1.5" fill="currentColor" />
        <circle cx="44" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="44" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "station",
    name: "Station Wagon",
    value: "Station Wagon",
    match: ["Station Wagon", "Touring"],
    svg: (
      <svg className="w-14 h-8" viewBox="0 0 56 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tavan Çıtası */}
        <line x1="20" y1="6.5" x2="40" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        {/* Gövde Dış Hatları */}
        <path
          d="M3 19V17C3 17 5 15.5 9 15.5H13L19 8.5H41C43 8.5 44 10 44 12V18.5V20H41.5C41 18 39 16.5 37 16.5C35 16.5 33 18 32.5 20H19.5C19 18 17 16.5 15 16.5C13 16.5 11 18 10.5 20H3V19Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cam Çizgileri */}
        <path d="M20 10.5H26V15H15L20 10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M28 10.5H35V15H28V10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M37 10.5H41.5V15H37V10.5Z" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        {/* Tekerlekler */}
        <circle cx="15" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="15" cy="20" r="1.5" fill="currentColor" />
        <circle cx="37" cy="20" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="37" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function BodyTypeExplorer() {
  const searchParams = useSearchParams();
  const currentKasa = searchParams.get("kasa");
  const currentDurum = searchParams.get("durum");
  const currentKampanya = searchParams.get("kampanya");

  const buildKasaUrl = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!val || currentKasa === val) {
      params.delete("kasa");
    } else {
      params.set("kasa", val);
    }
    const q = params.toString();
    return `/araclar${q ? `?${q}` : ""}`;
  };

  const toggleParam = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === val) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    const q = params.toString();
    return `/araclar${q ? `?${q}` : ""}`;
  };

  const hasAnyFilter = Boolean(currentKasa || currentDurum || currentKampanya);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-neutral-250 bg-white p-5 shadow-xs ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-150 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-neutral-950 uppercase tracking-tight">
              ARAÇ TİPİNE GÖRE KEŞFET
            </h2>
            <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
              Kasa tipi, Türkiye satış durumu veya finansman kampanyasına göre modelleri listeleyin
            </p>
          </div>
        </div>

        {hasAnyFilter && (
          <Link
            href="/araclar"
            className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-black text-red-600 transition hover:bg-red-100 shadow-2xs"
          >
            Filtreleri Temizle ✕
          </Link>
        )}
      </div>

      {/* Özel Filtre Butonları (Türkiye'de Satılanlar & Kampanyalı Araçlar) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Link
          href={toggleParam("durum", "TR_YAYINDA")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentDurum === "TR_YAYINDA"
              ? "bg-neutral-950 text-white shadow-xs ring-2 ring-neutral-900/30"
              : "border border-neutral-250 bg-neutral-50 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span>Türkiye&apos;de Satılanlar</span>
          {currentDurum === "TR_YAYINDA" && <span className="text-[10px]">✕</span>}
        </Link>

        <Link
          href={toggleParam("kampanya", "1")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentKampanya === "1"
              ? "bg-red-600 text-white shadow-xs ring-2 ring-red-500/30"
              : "border border-neutral-250 bg-neutral-50 text-neutral-700 hover:border-red-600 hover:text-red-600"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Kampanyalı Araçlar (%0 Faiz &amp; Destekler)</span>
          {currentKampanya === "1" && <span className="text-[10px]">✕</span>}
        </Link>
      </div>

      {/* Kasa Tipleri Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 pt-1">
        {BODY_TYPES.map((bt) => {
          const isActive = currentKasa === bt.value;
          return (
            <Link
              key={bt.id}
              href={buildKasaUrl(bt.value)}
              className={`group flex flex-col items-center justify-center gap-2 rounded-xl p-3.5 text-center transition-all ${
                isActive
                  ? "border-2 border-red-600 bg-red-50/70 text-red-700 shadow-xs"
                  : "border border-neutral-200 bg-neutral-50/60 text-neutral-700 hover:border-neutral-950 hover:bg-white hover:text-neutral-950 shadow-2xs"
              }`}
            >
              <div
                className={`transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-red-600" : "text-neutral-600 group-hover:text-neutral-950"
                }`}
              >
                {bt.svg}
              </div>
              <span className="text-xs font-black tracking-tight leading-tight">
                {bt.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
