"use client";

import { useState } from "react";
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
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  // Local filter states
  const current = (key: string) => searchParams.get(key) ?? "";

  const [marka, setMarka] = useState(current("marka"));
  const [segment, setSegment] = useState(current("segment"));
  const [kasa, setKasa] = useState(current("kasa"));
  const [durum, setDurum] = useState(current("durum"));
  const [maxFiyat, setMaxFiyat] = useState(current("maxFiyat"));
  const [minMenzil, setMinMenzil] = useState(current("minMenzil"));
  const [sirala, setSirala] = useState(current("sirala"));
  const [brandSearch, setBrandSearch] = useState("");

  // Açılır-kapanır menü (accordion) durumları
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    marka: true,
    fiyat: Boolean(current("maxFiyat")),
    menzil: Boolean(current("minMenzil")),
    kasa: Boolean(current("kasa")),
    segment: Boolean(current("segment")),
    durum: Boolean(current("durum")),
    sirala: Boolean(current("sirala")),
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyFilters = (customValues?: {
    marka?: string;
    segment?: string;
    kasa?: string;
    durum?: string;
    maxFiyat?: string;
    minMenzil?: string;
    sirala?: string;
  }) => {
    const next = new URLSearchParams();
    const vals = {
      marka,
      segment,
      kasa,
      durum,
      maxFiyat,
      minMenzil,
      sirala,
      ...customValues,
    };

    Object.entries(vals).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });

    router.push(`${pathname}?${next.toString()}`, { scroll: false });
    setMobileModalOpen(false);
  };

  const handleInstantChange = (key: string, val: string) => {
    if (key === "marka") setMarka(val);
    if (key === "segment") setSegment(val);
    if (key === "kasa") setKasa(val);
    if (key === "durum") setDurum(val);
    if (key === "maxFiyat") setMaxFiyat(val);
    if (key === "minMenzil") setMinMenzil(val);
    if (key === "sirala") setSirala(val);

    applyFilters({ [key]: val });
  };

  const resetFilters = () => {
    setMarka("");
    setSegment("");
    setKasa("");
    setDurum("");
    setMaxFiyat("");
    setMinMenzil("");
    setSirala("");
    router.push(pathname, { scroll: false });
    setMobileModalOpen(false);
  };

  const activeCount = [
    marka,
    segment,
    kasa,
    durum,
    maxFiyat,
    minMenzil,
    sirala,
  ].filter(Boolean).length;

  // Popüler markalar için hızlı haplar
  const popularBrands = ["TOGG", "Tesla", "BYD", "Kia", "Hyundai", "Renault", "BMW", "Mercedes-Benz"];

  const filteredBrands = brands.filter((b) =>
    b.label.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <>
      {/* MOBİL: Tam Ekran Modal Açma Butonu */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200/90 shadow-xs mb-2">
        <button
          onClick={() => setMobileModalOpen(true)}
          type="button"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3 text-xs font-black text-white shadow-xs transition hover:bg-neutral-800 active:scale-[0.99]"
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

      {/* MASAÜSTÜ: Üste Alınmış Açılır Menü (Accordion) Filtreleme Paneli */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-3">
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-xs sticky top-20">
          {/* Üst Bar: Başlık, Aktif Sayaç ve Temizleme */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <IconFilter className="h-3.5 w-3.5 text-red-600" />
                <span>FİLTRELER</span>
              </h2>
              {activeCount > 0 && (
                <span className="rounded-full bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-black text-red-600 hover:text-red-700 transition underline underline-offset-2"
              >
                Sıfırla
              </button>
            )}
          </div>

          {/* Açılır Menü (Accordion) Grupları */}
          <div className="flex flex-col gap-2">
            {/* 1. MARKA AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("marka")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.marka
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Marka</span>
                  {marka && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      {marka}
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.marka ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.marka && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-2.5 animate-in fade-in duration-150">
                  {/* Hızlı Marka Hapları */}
                  <div className="flex flex-wrap gap-1">
                    {popularBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleInstantChange("marka", marka === b ? "" : b)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          marka === b
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:border-black"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {/* Marka Seçim Listesi */}
                  <select
                    value={marka}
                    onChange={(e) => handleInstantChange("marka", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-red-600 transition"
                  >
                    <option value="">Tüm Markaları Gör</option>
                    {brands.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. FİYAT ARALIĞI AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("fiyat")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.fiyat
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Fiyat Aralığı</span>
                  {maxFiyat && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      ≤ {(Number(maxFiyat) / 1000000).toFixed(1)}M ₺
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.fiyat ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.fiyat && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-2.5 animate-in fade-in duration-150">
                  {/* Hızlı Fiyat Filtreleri */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "< 1.5 Milyon", val: "1500000" },
                      { label: "< 2.0 Milyon", val: "2000000" },
                      { label: "< 2.5 Milyon", val: "2500000" },
                      { label: "< 3.0 Milyon", val: "3000000" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => handleInstantChange("maxFiyat", maxFiyat === item.val ? "" : item.val)}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg text-center transition ${
                          maxFiyat === item.val
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:border-black"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Manuel Değer Girişi */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Maks. bütçe (₺)"
                      value={maxFiyat}
                      onChange={(e) => setMaxFiyat(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters({ maxFiyat })}
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => applyFilters({ maxFiyat })}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 text-white text-[11px] font-black hover:bg-neutral-800 transition"
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. MENZİL AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("menzil")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.menzil
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Menzil (WLTP)</span>
                  {minMenzil && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      ≥ {minMenzil} km
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.menzil ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.menzil && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-2.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "350+ km", val: "350" },
                      { label: "450+ km", val: "450" },
                      { label: "550+ km", val: "550" },
                      { label: "600+ km", val: "600" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => handleInstantChange("minMenzil", minMenzil === item.val ? "" : item.val)}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg text-center transition ${
                          minMenzil === item.val
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:border-black"
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
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => applyFilters({ minMenzil })}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 text-white text-[11px] font-black hover:bg-neutral-800 transition"
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. KASA TİPİ AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("kasa")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.kasa
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Kasa Tipi</span>
                  {kasa && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      {kasa}
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.kasa ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.kasa && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <select
                    value={kasa}
                    onChange={(e) => handleInstantChange("kasa", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  >
                    <option value="">Tüm Kasa Tipleri</option>
                    {bodyTypes.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 5. SEGMENT AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("segment")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.segment
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Segment</span>
                  {segment && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      {segment}
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.segment ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.segment && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <select
                    value={segment}
                    onChange={(e) => handleInstantChange("segment", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  >
                    <option value="">Tüm Segmentler</option>
                    {segments.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 6. PAZAR DURUMU AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("durum")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.durum
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Pazar Durumu</span>
                  {durum && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      {durum === "TR_YAYINDA" ? "TR Satışta" : durum === "TR_YAKINDA" ? "Yakında" : "TR Yok"}
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.durum ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.durum && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <select
                    value={durum}
                    onChange={(e) => handleInstantChange("durum", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  >
                    <option value="">Tümü</option>
                    <option value="TR_YAYINDA">Türkiye&apos;de Satışta</option>
                    <option value="TR_YAKINDA">Yakında Türkiye&apos;de</option>
                    <option value="TR_YOK">Yurt Dışında / TR&apos;de Yok</option>
                  </select>
                </div>
              )}
            </div>

            {/* 7. SIRALAMA AÇILIR MENÜSÜ */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection("sirala")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                  openSections.sirala
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>Sıralama</span>
                  {sirala && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                      Aktif
                    </span>
                  )}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openSections.sirala ? "rotate-180 text-neutral-400" : "text-neutral-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.sirala && (
                <div className="p-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-1 mb-1 flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <select
                    value={sirala}
                    onChange={(e) => handleInstantChange("sirala", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-red-600"
                  >
                    <option value="">Varsayılan (Fiyat Artan)</option>
                    <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
                    <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
                    <option value="menzil">En Uzun Menzil</option>
                    <option value="hizlanma">En Hızlı (0-100)</option>
                    <option value="puan">Editör Puanı</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MOBİL: Full Screen Modal Dialog */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden lg:hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-neutral-900 text-white">
            <div className="flex items-center gap-2">
              <IconFilter className="h-5 w-5 text-red-500" />
              <h3 className="text-base font-black uppercase tracking-wide">
                FİLTRELER
              </h3>
              {activeCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black">
                  {activeCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileModalOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:text-white"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>

          {/* Form Scroll Area with Accordions */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {/* Marka */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Marka
              </label>
              <select
                value={marka}
                onChange={(e) => setMarka(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              >
                <option value="">Tüm Markalar</option>
                {brands.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Segment */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              >
                <option value="">Tüm Segmentler</option>
                {segments.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kasa Tipi */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Kasa Tipi
              </label>
              <select
                value={kasa}
                onChange={(e) => setKasa(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              >
                <option value="">Tüm Kasa Tipleri</option>
                {bodyTypes.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pazar Durumu */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Pazar Durumu
              </label>
              <select
                value={durum}
                onChange={(e) => setDurum(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              >
                <option value="">Tümü</option>
                <option value="TR_YAYINDA">Türkiye&apos;de Satışta</option>
                <option value="TR_YAKINDA">Yakında Türkiye&apos;de</option>
                <option value="TR_YOK">Yurt Dışında / TR&apos;de Yok</option>
              </select>
            </div>

            {/* Maks Fiyat */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Maksimum Fiyat (₺)
              </label>
              <input
                type="number"
                placeholder="Örn: 2500000"
                value={maxFiyat}
                onChange={(e) => setMaxFiyat(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              />
            </div>

            {/* Min Menzil */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Minimum Menzil (km)
              </label>
              <input
                type="number"
                placeholder="Örn: 450"
                value={minMenzil}
                onChange={(e) => setMinMenzil(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              />
            </div>

            {/* Sıralama */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Sıralama
              </label>
              <select
                value={sirala}
                onChange={(e) => setSirala(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-900 outline-none"
              >
                <option value="">Varsayılan (Fiyat Artan)</option>
                <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
                <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
                <option value="menzil">En Uzun Menzil</option>
                <option value="hizlanma">En Hızlı (0-100)</option>
                <option value="puan">Editör Puanı</option>
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="border-t border-neutral-200 p-4 bg-neutral-50 flex items-center gap-3">
            <button
              onClick={resetFilters}
              type="button"
              className="flex-1 rounded-xl border border-neutral-300 py-3 text-xs font-black text-neutral-700 hover:border-black"
            >
              SIFIRLA
            </button>
            <button
              onClick={() => applyFilters()}
              type="button"
              className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white hover:bg-red-700 shadow-xs"
            >
              SONUÇLARI GÖR
            </button>
          </div>
        </div>
      )}
    </>
  );
}
