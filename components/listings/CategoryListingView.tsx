"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconClose,
  IconFilter,
  IconMap,
  IconCar,
  IconChevronRight,
  IconSparkles,
} from "@/components/ui/Icons";
import { LISTING_CATEGORIES, ListingCategoryConfig } from "@/lib/listingCategories";
import { CategoryIcon } from "./CategoryIcon";
import ListingRowCard from "./ListingRowCard";
import ListingCard, { ListingLite } from "./ListingCard";

type Props = {
  category: ListingCategoryConfig;
  listings: ListingLite[];
  brands: { brand: string }[];
  cities: { city: string }[];
  totalCount: number;
};

export default function CategoryListingView({
  category,
  listings,
  brands,
  cities,
  totalCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Açılır menü durumları
  const [activeDropdown, setActiveDropdown] = useState<
    "filter" | "sort" | "view" | "save" | null
  >(null);
  const [fullScreenModal, setFullScreenModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"row" | "compact" | "grid">("row");
  const [saveAlertMessage, setSaveAlertMessage] = useState<string | null>(null);

  // Filtre değerleri
  const current = (key: string) => searchParams.get(key) ?? "";
  const [selectedBrand, setSelectedBrand] = useState(current("marka"));
  const [selectedCity, setSelectedCity] = useState(current("sehir"));
  const [selectedCondition, setSelectedCondition] = useState(current("durum"));
  const [minPrice, setMinPrice] = useState(current("minFiyat"));
  const [maxPrice, setMaxPrice] = useState(current("maxFiyat"));
  const [minYear, setMinYear] = useState(current("minYil"));
  const [maxYear, setMaxYear] = useState(current("maxYil"));
  const [reportOnly, setReportOnly] = useState(current("rapor") === "1");
  const [currentSort, setCurrentSort] = useState(current("sirala") || "yeni");

  const toggleDropdown = (menu: "filter" | "sort" | "view" | "save") => {
    if (menu === "save") {
      setSaveAlertMessage("Aramanız başarıyla kaydedildi! Yeni ilanlarda bildirim alacaksınız.");
      setTimeout(() => setSaveAlertMessage(null), 3500);
      setActiveDropdown(null);
      return;
    }
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const applyQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setActiveDropdown(null);
    setFullScreenModal(false);
  };

  const handleSortChange = (val: string) => {
    setCurrentSort(val);
    applyQuery({ sirala: val });
  };

  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    applyQuery({
      marka: selectedBrand || null,
      sehir: selectedCity || null,
      durum: selectedCondition || null,
      minFiyat: minPrice || null,
      maxFiyat: maxPrice || null,
      minYil: minYear || null,
      maxYil: maxYear || null,
      rapor: reportOnly ? "1" : null,
    });
  };

  const resetFilters = () => {
    setSelectedBrand("");
    setSelectedCity("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setReportOnly(false);
    setCurrentSort("yeni");
    router.push(pathname, { scroll: false });
    setActiveDropdown(null);
    setFullScreenModal(false);
  };

  const activeFiltersCount = [
    selectedBrand,
    selectedCity,
    selectedCondition,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    reportOnly ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5 px-3 sm:px-0 sm:pt-4">
      {/* BAŞLIK VE KATEGORİ SEÇİMİ */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1E3F] to-slate-900 p-5 sm:p-7 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400">
                2.EL İLANLAR KATALOĞU
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-white">
                Tüm {category.name} İlanları ({totalCount})
              </h1>
            </div>
          </div>

          <Link
            href="/ilanlar"
            className="flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-white transition rounded-xl bg-white/10 px-3.5 py-2"
          >
            ← Tüm İlan Kategorileri
          </Link>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mt-1">
          {category.description} Doğrulanmış batarya raporları ve güven endeksiyle Türkiye geneli en güncel ikinci el {category.name.toLowerCase()} fırsatları.
        </p>

        {/* Diğer Kategori Hızlı Geçişleri */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 border-t border-white/10 mt-2">
          <span className="text-[10px] font-bold text-neutral-400 shrink-0 uppercase tracking-wide">
            Kategoriler:
          </span>
          {LISTING_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/ilanlar/${cat.slug}`}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition flex items-center gap-1 ${
                cat.slug === category.slug
                  ? "bg-sky-500 text-white shadow"
                  : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <CategoryIcon slug={cat.slug} className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* KAYDET BİLDİRİMİ */}
      {saveAlertMessage && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-800 animate-in fade-in duration-200">
          ✓ {saveAlertMessage}
        </div>
      )}

      {/* YUKARI KISIMDA 4 ANA SEÇENEK: Filtrele, Sırala, Görünüm, Aramayı Kaydet */}
      <div className="relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
          {/* 1. Filtrele */}
          <button
            onClick={() => toggleDropdown("filter")}
            type="button"
            className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-black transition ${
              activeDropdown === "filter"
                ? "bg-sky-600 text-white shadow-md"
                : "bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <IconFilter className="h-4 w-4" />
            <span>FİLTRELE</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* 2. Sırala */}
          <button
            onClick={() => toggleDropdown("sort")}
            type="button"
            className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-black transition ${
              activeDropdown === "sort"
                ? "bg-sky-600 text-white shadow-md"
                : "bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <span>⇅</span>
            <span>SIRALA</span>
          </button>

          {/* 3. Görünüm */}
          <button
            onClick={() => toggleDropdown("view")}
            type="button"
            className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-black transition ${
              activeDropdown === "view"
                ? "bg-sky-600 text-white shadow-md"
                : "bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <span>⊞</span>
            <span>GÖRÜNÜM</span>
          </button>

          {/* 4. Aramayı Kaydet */}
          <button
            onClick={() => toggleDropdown("save")}
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-black bg-neutral-50 text-neutral-800 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <span>🔔</span>
            <span>ARAMAYI KAYDET</span>
          </button>
        </div>

        {/* ALTA AÇILAN MENÜLER (DROPDOWNS) */}

        {/* 1. Filtrele Açılır Menüsü */}
        {activeDropdown === "filter" && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-neutral-900 uppercase">
                {category.name} Filtreleri
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFullScreenModal(true)}
                  className="text-xs font-extrabold text-sky-600 hover:underline"
                >
                  Tam Sayfada Genişlet ↗
                </button>
                <button
                  onClick={() => setActiveDropdown(null)}
                  className="text-neutral-400 hover:text-neutral-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Marka */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">Marka</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map((b) => (
                    <option key={b.brand} value={b.brand}>
                      {b.brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Şehir */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">Şehir</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                >
                  <option value="">Tüm Şehirler</option>
                  {cities.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fiyat Aralığı */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">Fiyat (Min - Max ₺)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                  />
                </div>
              </div>

              {/* Model Yılı */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">Yıl (Min - Max)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    placeholder="2018"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="2026"
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                  />
                </div>
              </div>

              {/* Durum */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">Araç Durumu</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="rounded-xl border border-neutral-300 p-2 text-xs font-bold text-neutral-800 outline-none"
                >
                  <option value="">Tümü (Sıfır & İkinci El)</option>
                  <option value="IKINCI_EL">İkinci El</option>
                  <option value="SIFIR">Sıfır Kilometre</option>
                </select>
              </div>

              {/* Raporlu Kutusu */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="raporCheckbox"
                  checked={reportOnly}
                  onChange={(e) => setReportOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-sky-600 accent-sky-600"
                />
                <label htmlFor="raporCheckbox" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Sadece Batarya Raporlu İlanlar
                </label>
              </div>

              <div className="sm:col-span-3 lg:col-span-4 flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Temizle
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-black text-white hover:bg-sky-700 shadow-md"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Sırala Açılır Menüsü */}
        {activeDropdown === "sort" && (
          <div className="absolute top-full left-0 right-0 sm:left-1/4 sm:right-1/4 mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl animate-in fade-in duration-150">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
              Sıralama Seçenekleri
            </h4>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-neutral-800">
              {[
                { label: "İlan Tarihine Göre (En Yeni)", value: "yeni" },
                { label: "Fiyata Göre (Önce En Düşük)", value: "ucuz" },
                { label: "Fiyata Göre (Önce En Yüksek)", value: "pahali" },
                { label: "Kilometreye Göre (En Düşük)", value: "km-artan" },
                { label: "Model Yılına Göre (En Yeni)", value: "yil-azalan" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSortChange(opt.value)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition text-left ${
                    currentSort === opt.value
                      ? "bg-sky-50 text-sky-700 font-black"
                      : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentSort === opt.value && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Görünüm Açılır Menüsü */}
        {activeDropdown === "view" && (
          <div className="absolute top-full right-0 sm:right-1/4 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in duration-150">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
              Görünüm Seçenekleri
            </h4>
            <div className="flex flex-col gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setViewMode("row"); setActiveDropdown(null); }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  viewMode === "row" ? "bg-sky-50 text-sky-700 font-black" : "hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <span>Yatay Liste (Sütun Kartı)</span>
                {viewMode === "row" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("compact"); setActiveDropdown(null); }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  viewMode === "compact" ? "bg-sky-50 text-sky-700 font-black" : "hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <span>Kompakt Satır Görünümü</span>
                {viewMode === "compact" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("grid"); setActiveDropdown(null); }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  viewMode === "grid" ? "bg-sky-50 text-sky-700 font-black" : "hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <span>Galeri / Izgara Görünümü</span>
                {viewMode === "grid" && <span>✓</span>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAM SAYFA SEÇENEKLER / FİLTRELER MODAL DIALOG */}
      {fullScreenModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.icon}</span>
              <h3 className="text-base font-black">
                {category.name} — Tam Sayfa Seçenekler
              </h3>
            </div>
            <button
              onClick={() => setFullScreenModal(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 font-black"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div>
              <h4 className="text-xs font-black uppercase text-sky-700 tracking-wider">
                FARKLI BİR İLAN KATEGORİSİNE GEÇ
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                {LISTING_CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/ilanlar/${c.slug}`}
                    onClick={() => setFullScreenModal(false)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                      c.slug === category.slug
                        ? "border-sky-500 bg-sky-50 font-black text-sky-900"
                        : "border-neutral-200 hover:bg-neutral-50 font-bold text-neutral-800"
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-xs leading-tight">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-5">
              <h4 className="text-xs font-black uppercase text-sky-700 tracking-wider mb-4">
                DETAYLI FİLTRE KRİTERLERİ
              </h4>
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Marka</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  >
                    <option value="">Tüm Markalar</option>
                    {brands.map((b) => (
                      <option key={b.brand} value={b.brand}>{b.brand}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Şehir</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Min. Fiyat (₺)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Örn: 500000"
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Maks. Fiyat (₺)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Örn: 2000000"
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Min. Model Yılı</label>
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    placeholder="2020"
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-800 uppercase">Maks. Model Yılı</label>
                  <input
                    type="number"
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    placeholder="2026"
                    className="rounded-xl border border-neutral-300 p-3 text-sm font-bold text-neutral-900 outline-none"
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="border-t border-neutral-200 p-4 bg-white flex items-center justify-end gap-3 max-w-4xl mx-auto w-full">
            <button
              onClick={resetFilters}
              type="button"
              className="rounded-xl border border-neutral-300 px-5 py-3 text-xs font-black text-neutral-700"
            >
              Filtreleri Temizle
            </button>
            <button
              onClick={() => handleFilterSubmit()}
              type="button"
              className="rounded-xl bg-sky-600 px-8 py-3 text-xs font-black text-white shadow-lg hover:bg-sky-700"
            >
              Sonuçları Listele ({totalCount})
            </button>
          </div>
        </div>
      )}

      {/* İLAN LİSTESİ */}
      <section className="flex flex-col gap-3">
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <h3 className="text-base font-black text-neutral-900">
              Bu kategoride kriterlerinize uygun ilan bulunamadı.
            </h3>
            <p className="text-xs text-neutral-500 max-w-md">
              Filtrelerinizi sıfırlayarak veya diğer elektrikli araç kategorilerini inceleyerek aradığınız aracı bulabilirsiniz.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-black text-white hover:bg-sky-700"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((l) => (
              <ListingRowCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
