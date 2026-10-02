"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconClose, IconFilter, IconSearch } from "@/components/ui/Icons";

export type FilterOption = { value: string; label: string };

type Props = {
  brands: FilterOption[];
  segments: FilterOption[];
  bodyTypes: FilterOption[];
  totalCount: number;
};

export default function VehiclesExplorer({
  brands,
  segments,
  bodyTypes,
  totalCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter values from URL
  const current = (key: string) => searchParams.get(key) ?? "";

  const [marka, setMarka] = useState(current("marka"));
  const [segment, setSegment] = useState(current("segment"));
  const [kasa, setKasa] = useState(current("kasa"));
  const [durum, setDurum] = useState(current("durum"));
  const [kampanya, setKampanya] = useState(current("kampanya"));
  const [maxFiyat, setMaxFiyat] = useState(current("maxFiyat"));
  const [minMenzil, setMinMenzil] = useState(current("minMenzil"));
  const [sirala, setSirala] = useState(current("sirala"));
  const [brandSearch, setBrandSearch] = useState("");

  // Sync state when URL searchParams changes
  useEffect(() => {
    setMarka(current("marka"));
    setSegment(current("segment"));
    setKasa(current("kasa"));
    setDurum(current("durum"));
    setKampanya(current("kampanya"));
    setMaxFiyat(current("maxFiyat"));
    setMinMenzil(current("minMenzil"));
    setSirala(current("sirala"));
  }, [searchParams]);

  // Click outside listener to close open dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const applyFilters = (customValues?: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const vals: Record<string, string | undefined> = {
      marka,
      segment,
      kasa,
      durum,
      kampanya,
      maxFiyat,
      minMenzil,
      sirala,
      ...customValues,
    };

    Object.entries(vals).forEach(([k, v]) => {
      if (v && v.trim() !== "") next.set(k, v.trim());
    });

    router.push(`${pathname}?${next.toString()}`, { scroll: false });
    setActiveDropdown(null);
    setMobileModalOpen(false);
  };

  const handleSingleChange = (key: string, val: string) => {
    const nextVal = val;
    if (key === "marka") setMarka(nextVal);
    if (key === "segment") setSegment(nextVal);
    if (key === "kasa") setKasa(nextVal);
    if (key === "durum") setDurum(nextVal);
    if (key === "kampanya") setKampanya(nextVal);
    if (key === "maxFiyat") setMaxFiyat(nextVal);
    if (key === "minMenzil") setMinMenzil(nextVal);
    if (key === "sirala") setSirala(nextVal);

    applyFilters({ [key]: nextVal });
  };

  const resetFilters = () => {
    setMarka("");
    setSegment("");
    setKasa("");
    setDurum("");
    setKampanya("");
    setMaxFiyat("");
    setMinMenzil("");
    setSirala("");
    router.push(pathname, { scroll: false });
    setActiveDropdown(null);
    setMobileModalOpen(false);
  };

  const activeCount = [
    marka,
    segment,
    kasa,
    durum,
    kampanya === "1" ? "kampanya" : "",
    maxFiyat,
    minMenzil,
    sirala,
  ].filter(Boolean).length;

  const popularBrands = [
    "TOGG",
    "Tesla",
    "BYD",
    "Kia",
    "Hyundai",
    "Renault",
    "BMW",
    "Mercedes-Benz",
    "MG",
    "Volvo",
  ];

  const filteredBrands = brands.filter((b) =>
    b.label.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const sortLabels: Record<string, string> = {
    "fiyat-artan": "Fiyat: En Düşük",
    "fiyat-azalan": "Fiyat: En Yüksek",
    menzil: "En Uzun Menzil",
    hizlanma: "0-100 En Hızlı",
    puan: "e-aracım Puanı",
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-3">
      {/* MASAÜSTÜ: ÜSTTE YER ALAN AÇILIR MENÜLÜ FİLTRE ÇUBUĞU */}
      <div className="hidden lg:flex flex-col gap-2.5 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-xs">
        {/* Üst Satır: Açılır Menü Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          {/* FİLTRE İKONU / BAŞLIK */}
          <div className="flex items-center gap-2 pr-2 border-r border-neutral-200 text-neutral-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-red-500 shadow-xs">
              <IconFilter className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900">FİLTRELER</span>
              <span className="text-[10px] text-neutral-400 font-semibold">{totalCount} Model</span>
            </div>
          </div>

          {/* 1. MARKA AÇILIR MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("marka")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                marka
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "marka"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{marka ? `Marka: ${marka}` : "Marka"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "marka" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "marka" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-72 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Marka Seçin</span>
                  {marka && (
                    <button
                      onClick={() => handleSingleChange("marka", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Popüler Marka Hapları */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {popularBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleSingleChange("marka", marka === b ? "" : b)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                        marka === b
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-neutral-100 border border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Marka Arama Kutusu */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Marka filtrele..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-neutral-900 outline-none focus:border-red-600"
                  />
                  {brandSearch && (
                    <button
                      onClick={() => setBrandSearch("")}
                      className="absolute right-2 top-2 text-[10px] font-bold text-neutral-400 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Marka Listesi */}
                <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 divide-y divide-neutral-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSingleChange("marka", "")}
                    className={`px-2.5 py-1.5 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      !marka ? "bg-red-50 text-red-700" : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>Tüm Markalar</span>
                    {!marka && <span>✓</span>}
                  </button>
                  {filteredBrands.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => handleSingleChange("marka", b.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-left font-bold transition flex items-center justify-between ${
                        marka === b.value
                          ? "bg-red-50 text-red-700"
                          : "hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <span>{b.label}</span>
                      {marka === b.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. KASA TİPİ AÇILIR MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("kasa")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                kasa
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "kasa"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{kasa ? `Kasa: ${kasa}` : "Kasa Tipi"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "kasa" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "kasa" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Kasa Tipi</span>
                  {kasa && (
                    <button
                      onClick={() => handleSingleChange("kasa", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSingleChange("kasa", "")}
                    className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      !kasa ? "bg-red-50 text-red-700" : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>Tüm Kasa Tipleri</span>
                    {!kasa && <span>✓</span>}
                  </button>
                  {[
                    "SUV",
                    "Sedan",
                    "Hatchback",
                    "Ticari",
                    "Coupe",
                    "Station Wagon",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSingleChange("kasa", item)}
                      className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                        kasa === item
                          ? "bg-red-50 text-red-700"
                          : "hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <span>{item}</span>
                      {kasa === item && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. FİYAT ARALIĞI AÇILIR MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("fiyat")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                maxFiyat
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "fiyat"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{maxFiyat ? `Bütçe: ≤ ${(Number(maxFiyat) / 1000000).toFixed(1)}M ₺` : "Fiyat / Bütçe"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "fiyat" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "fiyat" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-72 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Maksimum Bütçe</span>
                  {maxFiyat && (
                    <button
                      onClick={() => handleSingleChange("maxFiyat", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Hızlı Bütçe Butonları */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: "≤ 1.5 Milyon ₺ (%25 ÖTV)", val: "1500000" },
                    { label: "≤ 2.0 Milyon ₺", val: "2000000" },
                    { label: "≤ 2.5 Milyon ₺", val: "2500000" },
                    { label: "≤ 3.5 Milyon ₺", val: "3500000" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleSingleChange("maxFiyat", maxFiyat === item.val ? "" : item.val)}
                      className={`text-[10px] font-bold py-1.5 px-2 rounded-lg text-center transition ${
                        maxFiyat === item.val
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Manuel Bütçe Girişi */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Maks. bütçe (₺)"
                    value={maxFiyat}
                    onChange={(e) => setMaxFiyat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters({ maxFiyat })}
                    className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => applyFilters({ maxFiyat })}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 text-white text-[11px] font-black hover:bg-neutral-800 transition shadow-xs"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. MENZİL AÇILIR MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("menzil")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                minMenzil
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "menzil"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{minMenzil ? `Menzil: ≥ ${minMenzil} km` : "Menzil (WLTP)"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "menzil" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "menzil" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-64 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Minimum Menzil</span>
                  {minMenzil && (
                    <button
                      onClick={() => handleSingleChange("minMenzil", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: "350+ km", val: "350" },
                    { label: "450+ km", val: "450" },
                    { label: "550+ km", val: "550" },
                    { label: "650+ km", val: "650" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleSingleChange("minMenzil", minMenzil === item.val ? "" : item.val)}
                      className={`text-[10px] font-bold py-1.5 px-2 rounded-lg text-center transition ${
                        minMenzil === item.val
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min. menzil (km)"
                    value={minMenzil}
                    onChange={(e) => setMinMenzil(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters({ minMenzil })}
                    className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => applyFilters({ minMenzil })}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 text-white text-[11px] font-black hover:bg-neutral-800 transition shadow-xs"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. SEGMENT AÇILIR MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("segment")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                segment
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "segment"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{segment ? `Segment: ${segment}` : "Segment"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "segment" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "segment" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-56 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Segment Seçin</span>
                  {segment && (
                    <button
                      onClick={() => handleSingleChange("segment", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSingleChange("segment", "")}
                    className={`px-3 py-1.5 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      !segment ? "bg-red-50 text-red-700" : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>Tüm Segmentler</span>
                    {!segment && <span>✓</span>}
                  </button>
                  {segments.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleSingleChange("segment", s.value)}
                      className={`px-3 py-1.5 rounded-lg text-left font-bold transition flex items-center justify-between ${
                        segment === s.value
                          ? "bg-red-50 text-red-700"
                          : "hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <span>{s.label} Segmenti</span>
                      {segment === s.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. SATIŞ / KAMPANYA DURUMU */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("durum")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                durum || kampanya === "1"
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "durum"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>
                {kampanya === "1"
                  ? "Kampanyalı Araçlar"
                  : durum === "Satışta"
                  ? "Türkiye'de Satışta"
                  : "Satış & Kampanya"}
              </span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "durum" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "durum" && (
              <div className="absolute top-full left-0 mt-2 z-40 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Durum Seçin</span>
                  {(durum || kampanya === "1") && (
                    <button
                      onClick={() => applyFilters({ durum: "", kampanya: "" })}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => applyFilters({ durum: "", kampanya: "" })}
                    className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      !durum && kampanya !== "1"
                        ? "bg-red-50 text-red-700"
                        : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>Tüm Araçlar</span>
                    {!durum && kampanya !== "1" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilters({ durum: "Satışta", kampanya: "" })}
                    className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      durum === "Satışta"
                        ? "bg-red-50 text-red-700"
                        : "hover:bg-neutral-50 text-neutral-800"
                    }`}
                  >
                    <span>🇹🇷 Türkiye&apos;de Satışta Olanlar</span>
                    {durum === "Satışta" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilters({ kampanya: "1", durum: "" })}
                    className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                      kampanya === "1"
                        ? "bg-red-50 text-red-700"
                        : "hover:bg-neutral-50 text-neutral-800"
                    }`}
                  >
                    <span>⚡ %0 Faiz / Kredi Kampanyalı</span>
                    {kampanya === "1" && <span>✓</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7. SIRALAMA AÇILIR MENÜSÜ */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => toggleDropdown("sirala")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition border ${
                sirala
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                  : activeDropdown === "sirala"
                  ? "border-red-600 bg-red-50/40 text-red-700"
                  : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/90 text-neutral-800"
              }`}
            >
              <span>{sirala ? sortLabels[sirala] || "Sıralama" : "Sıralama"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "sirala" ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "sirala" && (
              <div className="absolute top-full right-0 mt-2 z-40 w-60 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Sıralama Seçin</span>
                  {sirala && (
                    <button
                      onClick={() => handleSingleChange("sirala", "")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Varsayılan
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  {[
                    { label: "Fiyat: En Düşükten Yükseğe", val: "fiyat-artan" },
                    { label: "Fiyat: En Yüksekten Düşüğe", val: "fiyat-azalan" },
                    { label: "Menzil: En Uzun", val: "menzil" },
                    { label: "0-100: En Hızlı Hızlanma", val: "hizlanma" },
                    { label: "e-aracım Editör Puanı", val: "puan" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => handleSingleChange("sirala", s.val)}
                      className={`px-3 py-2 rounded-lg text-left font-bold transition flex items-center justify-between ${
                        sirala === s.val
                          ? "bg-red-50 text-red-700"
                          : "hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <span>{s.label}</span>
                      {sirala === s.val && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alt Satır: Aktif Filtre Rozetleri & Temizleme Butonu */}
        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-400">Seçili Filtreler:</span>

            {marka && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>Marka: {marka}</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("marka", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {kasa && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>Kasa: {kasa}</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("kasa", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {maxFiyat && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>Maks: {(Number(maxFiyat) / 1000000).toFixed(1)}M ₺</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("maxFiyat", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {minMenzil && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>Menzil: ≥ {minMenzil} km</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("minMenzil", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {segment && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>Segment: {segment}</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("segment", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {durum && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>{durum}</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("durum", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {kampanya === "1" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                <span>Kampanyalı</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("kampanya", "")}
                  className="text-red-200 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            {sirala && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                <span>{sortLabels[sirala] || sirala}</span>
                <button
                  type="button"
                  onClick={() => handleSingleChange("sirala", "")}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-xs font-black text-red-600 hover:text-red-700 underline underline-offset-2"
            >
              Tüm Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* MOBİL: Filtre Açma Butonu ve Modal Çekmecesi */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200/90 shadow-xs">
        <button
          onClick={() => setMobileModalOpen(true)}
          type="button"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3 text-xs font-black text-white shadow-xs transition hover:bg-neutral-800"
        >
          <IconFilter className="h-4 w-4 text-red-500" />
          <span>FİLTRELERİ AÇILIR MENÜDEN SEÇ</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            type="button"
            className="rounded-xl border border-neutral-300 px-3.5 py-3 text-xs font-bold text-neutral-700 hover:border-black hover:text-black transition"
          >
            Temizle
          </button>
        )}
      </div>

      {/* MOBİL TAM EKRAN FİLTRELEME MODALI */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 bg-neutral-950 text-white">
              <div className="flex items-center gap-2">
                <IconFilter className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-black uppercase tracking-wider">FİLTRELER</h3>
                <span className="text-xs text-neutral-400 font-semibold">({totalCount} Araç)</span>
              </div>
              <button
                onClick={() => setMobileModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Marka Seçimi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Marka</label>
                <select
                  value={marka}
                  onChange={(e) => setMarka(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kasa Tipi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Kasa Tipi</label>
                <select
                  value={kasa}
                  onChange={(e) => setKasa(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                >
                  <option value="">Tüm Kasa Tipleri</option>
                  {["SUV", "Sedan", "Hatchback", "Ticari", "Coupe", "Station Wagon"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bütçe */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Maksimum Bütçe (₺)</label>
                <input
                  type="number"
                  placeholder="Örn: 2000000"
                  value={maxFiyat}
                  onChange={(e) => setMaxFiyat(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                />
              </div>

              {/* Menzil */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Minimum Menzil (km)</label>
                <input
                  type="number"
                  placeholder="Örn: 450"
                  value={minMenzil}
                  onChange={(e) => setMinMenzil(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                />
              </div>

              {/* Segment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Segment</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                >
                  <option value="">Tüm Segmentler</option>
                  {segments.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} Segmenti
                    </option>
                  ))}
                </select>
              </div>

              {/* Sıralama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wide text-neutral-900">Sıralama</label>
                <select
                  value={sirala}
                  onChange={(e) => setSirala(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-bold text-neutral-900"
                >
                  <option value="">Varsayılan Sıralama</option>
                  <option value="fiyat-artan">Fiyat: En Düşük</option>
                  <option value="fiyat-azalan">Fiyat: En Yüksek</option>
                  <option value="menzil">En Uzun Menzil</option>
                  <option value="hizlanma">0-100 En Hızlı</option>
                  <option value="puan">e-aracım Puanı</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-2 border-t border-neutral-100 p-4 bg-neutral-50">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 rounded-xl border border-neutral-300 py-3 text-xs font-bold text-neutral-700 hover:border-black"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white hover:bg-red-700 shadow-xs"
              >
                Uygula ({totalCount} Araç)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
