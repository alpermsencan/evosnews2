"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Dolubatarya tarzı modern araç kasa tipleri ve özel SVG silüetleri
const BODY_TYPES = [
  {
    id: "suv",
    name: "SUV / Crossover",
    value: "SUV",
    match: ["SUV", "Crossover", "Arazi"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 17V15C3 15 5 14 8 14H12L17 7H31L36 14H42C44.5 14 45 15.5 45 17V18H41C41 16.34 39.66 15 38 15C36.34 15 35 16.34 35 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H3V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="38" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M18 9H23V14H15L18 9Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 9H30L33 14H25V9Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "sedan",
    name: "Sedan",
    value: "Sedan",
    match: ["Sedan", "Fastback"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 17V15.5C2 15.5 4 14.5 8 14.5H11L18 8H30L37 14.5H43C45 14.5 46 15.5 46 17V18H41C41 16.34 39.66 15 38 15C36.34 15 35 16.34 35 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H2V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="38" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M19 10H23V14.5H14L19 10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 10H29L34 14.5H25V10Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "hatchback",
    name: "Hatchback",
    value: "Hatchback",
    match: ["Hatchback", "Kompakt"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 17V15C3 15 5 14.5 8 14.5H12L17 9H31L35 14.5H41C43 14.5 44 15.5 44 17V18H40C40 16.34 38.66 15 37 15C35.34 15 34 16.34 34 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H3V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="37" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M18 10.5H23V14.5H14.5L18 10.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 10.5H29.5L32 14.5H25V10.5Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "ticari",
    name: "Minivan / Ticari",
    value: "Minivan",
    match: ["Minivan", "Ticari", "Panelvan"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 17V15C3 15 5 14 8 14H12L15 6H38C40 6 41 7 41 9V17V18H37C37 16.34 35.66 15 34 15C32.34 15 31 16.34 31 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H3V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="34" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M16 8H23V13.5H11.5L16 8Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 8H31V13.5H25V8Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M33 8H38V13.5H33V8Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "coupe",
    name: "Coupe / Spor",
    value: "Coupe",
    match: ["Coupe", "Cabrio", "Roadster", "Spor"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 17V16C2 16 5 15 8 15H11L20 9.5H31L39 15H44C45.5 15 46 16 46 17V18H41C41 16.34 39.66 15 38 15C36.34 15 35 16.34 35 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H2V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="38" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M21 11H25V15H16L21 11Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M27 11H30L35 15H27V11Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "station",
    name: "Station Wagon",
    value: "Station Wagon",
    match: ["Station Wagon", "Touring"],
    svg: (
      <svg className="w-12 h-7" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 17V15.5C2 15.5 4 14.5 8 14.5H11L17 8H37C39 8 40 9 40 11V17V18H38C38 16.34 36.66 15 35 15C33.34 15 32 16.34 32 18H17C17 16.34 15.66 15 14 15C12.34 15 11 16.34 11 18H2V17Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="35" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M18 10H23V14.5H13L18 10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 10H31V14.5H25V10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M33 10H37V14.5H33V10Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function BodyTypeExplorer() {
  const searchParams = useSearchParams();
  const currentKasa = searchParams.get("kasa");

  const buildUrl = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!val || currentKasa === val) {
      params.delete("kasa");
    } else {
      params.set("kasa", val);
    }
    const q = params.toString();
    return `/araclar${q ? `?${q}` : ""}`;
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 font-bold text-sm">
            ⚡
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
              ARAÇ TİPİNE GÖRE KEŞFET
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">
              İhtiyacınıza uygun kasa tipini seçerek elektrikli modelleri listeleyin
            </p>
          </div>
        </div>

        {currentKasa && (
          <Link
            href="/araclar"
            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600 transition hover:bg-neutral-200"
          >
            Filtreyi Temizle ✕
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 pt-1">
        {BODY_TYPES.map((bt) => {
          const isActive = currentKasa === bt.value;
          return (
            <Link
              key={bt.id}
              href={buildUrl(bt.value)}
              className={`group flex flex-col items-center justify-center gap-2 rounded-xl p-3.5 text-center transition-all ${
                isActive
                  ? "border-2 border-sky-600 bg-sky-50/80 text-sky-700 shadow-sm ring-2 ring-sky-500/20"
                  : "border border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:border-sky-400 hover:bg-sky-50/40 hover:text-sky-700"
              }`}
            >
              <div
                className={`transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-sky-600" : "text-neutral-500 group-hover:text-sky-600"
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
