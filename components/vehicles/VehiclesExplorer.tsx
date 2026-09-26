"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconClose, IconFilter, IconSearch, IconSparkles } from "@/components/ui/Icons";

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

  // Local filter states for immediate responsiveness in modal
  const current = (key: string) => searchParams.get(key) ?? "";

  const [marka, setMarka] = useState(current("marka"));
  const [segment, setSegment] = useState(current("segment"));
  const [kasa, setKasa] = useState(current("kasa"));
  const [durum, setDurum] = useState(current("durum"));
  const [maxFiyat, setMaxFiyat] = useState(current("maxFiyat"));
  const [minMenzil, setMinMenzil] = useState(current("minMenzil"));
  const [sirala, setSirala] = useState(current("sirala"));

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

  return (
    <>
      {/* MOBİL: Tam Ekran Modal Açma Butonu */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm">
        <button
          onClick={() => setMobileModalOpen(true)}
          type="button"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-black text-white shadow transition hover:bg-teal-800 active:scale-[0.99]"
        >
          <IconFilter className="h-4 w-4" />
          <span>FİLTRELERİ AÇ</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-teal-800">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            type="button"
            className="rounded-xl border border-neutral-300 px-4 py-3 text-xs font-bold text-neutral-600 hover:border-neutral-400"
          >
            Temizle
          </button>
        )}
      </div>

      {/* MASAÜSTÜ (WEB): Solda Dikey Filtreleme Menüsü (Büyük ve Kalın Yazı Tipleri) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sticky top-24">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <h2 className="text-base font-black uppercase tracking-wide text-neutral-900 flex items-center gap-2">
              <IconFilter className="h-4 w-4 text-teal-700" />
              <span>FİLTRELER</span>
            </h2>
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-black text-teal-700 hover:text-teal-900 underline"
              >
                Sıfırla
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Marka */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Marka
              </label>
              <select
                value={marka}
                onChange={(e) => handleInstantChange("marka", e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => handleInstantChange("segment", e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Kasa Tipi
              </label>
              <select
                value={kasa}
                onChange={(e) => handleInstantChange("kasa", e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Pazar Durumu
              </label>
              <select
                value={durum}
                onChange={(e) => handleInstantChange("durum", e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
              >
                <option value="">Tümü</option>
                <option value="TR_YAYINDA">Türkiye&apos;de Satışta</option>
                <option value="TR_YAKINDA">Yakında Türkiye&apos;de</option>
                <option value="TR_YOK">Yurt Dışında / TR&apos;de Yok</option>
              </select>
            </div>

            {/* Maksimum Fiyat */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Maks. Fiyat (₺)
              </label>
              <input
                type="number"
                placeholder="Örn: 2500000"
                value={maxFiyat}
                onChange={(e) => setMaxFiyat(e.target.value)}
                onBlur={() => applyFilters({ maxFiyat })}
                onKeyDown={(e) => e.key === "Enter" && applyFilters({ maxFiyat })}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </div>

            {/* Minimum Menzil */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Min. Menzil (km)
              </label>
              <input
                type="number"
                placeholder="Örn: 450"
                value={minMenzil}
                onChange={(e) => setMinMenzil(e.target.value)}
                onBlur={() => applyFilters({ minMenzil })}
                onKeyDown={(e) => e.key === "Enter" && applyFilters({ minMenzil })}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </div>

            {/* Sıralama */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black tracking-wide text-neutral-800 uppercase">
                Sıralama
              </label>
              <select
                value={sirala}
                onChange={(e) => handleInstantChange("sirala", e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white"
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
        </div>
      </aside>

      {/* MOBİL: Full Screen Modal Dialog */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden lg:hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-neutral-50">
            <div className="flex items-center gap-2">
              <IconFilter className="h-5 w-5 text-teal-700" />
              <h3 className="text-lg font-black text-neutral-900">
                FİLTRELER
              </h3>
            </div>
            <button
              onClick={() => setMobileModalOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Marka */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-neutral-800">
                Marka
              </label>
              <select
                value={marka}
                onChange={(e) => setMarka(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
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
              <label className="text-xs font-black uppercase text-neutral-800">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
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
              <label className="text-xs font-black uppercase text-neutral-800">
                Kasa Tipi
              </label>
              <select
                value={kasa}
                onChange={(e) => setKasa(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
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
              <label className="text-xs font-black uppercase text-neutral-800">
                Pazar Durumu
              </label>
              <select
                value={durum}
                onChange={(e) => setDurum(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
              >
                <option value="">Tümü</option>
                <option value="TR_YAYINDA">Türkiye&apos;de Satışta</option>
                <option value="TR_YAKINDA">Yakında Türkiye&apos;de</option>
                <option value="TR_YOK">Yurt Dışında / TR&apos;de Yok</option>
              </select>
            </div>

            {/* Maks Fiyat */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-neutral-800">
                Maks. Fiyat (₺)
              </label>
              <input
                type="number"
                placeholder="Örn: 2000000"
                value={maxFiyat}
                onChange={(e) => setMaxFiyat(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
              />
            </div>

            {/* Min Menzil */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-neutral-800">
                Min. Menzil (km)
              </label>
              <input
                type="number"
                placeholder="Örn: 400"
                value={minMenzil}
                onChange={(e) => setMinMenzil(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
              />
            </div>

            {/* Sıralama */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-neutral-800">
                Sıralama
              </label>
              <select
                value={sirala}
                onChange={(e) => setSirala(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-900 outline-none"
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

          {/* Sticky Footer */}
          <div className="border-t border-neutral-200 p-4 bg-white flex items-center gap-3">
            <button
              onClick={resetFilters}
              type="button"
              className="flex-1 rounded-xl border-2 border-neutral-300 py-3.5 text-sm font-black text-neutral-700 hover:bg-neutral-100"
            >
              Temizle
            </button>
            <button
              onClick={() => applyFilters()}
              type="button"
              className="flex-[2] rounded-xl bg-teal-700 py-3.5 text-sm font-black text-white shadow-lg hover:bg-teal-800"
            >
              Filtreleri Uygula
            </button>
          </div>
        </div>
      )}
    </>
  );
}
