"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { BRANDS } from "@/lib/brands";
import { IconGauge, IconBattery, IconBolt, IconCheck, IconClose, IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  slug: string;
  year: number;
  segment: string;
  bodyType: string;
  image: string;
  images: string[];
  marketStatus: string;
  price: number;
  rangeKm: number;
  batteryKwh: number;
  motorPowerHp: number;
  motorPowerKw: number;
  acceleration: number;
  topSpeed: number;
  consumption: number;
  driveType: string;
  rating: number | null;
  dcChargeKw: number | null;
  chargeMin: number | null;
  trunkLiter: number | null;
  warranty: string | null;
  pros: string[];
  cons: string[];
  description: string;
  syncImages: {
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }[];
}

interface Article {
  id: string;
  title: string;
  slug: string;
  spot: string;
  image: string;
  publishedAt: Date;
  readTime: number | null;
}

interface VehicleHubClientProps {
  vehicles: Vehicle[];
  articles: Article[];
  testDriveVehicle: Vehicle;
}

const BRAND_POPULARITY: Record<string, number> = {
  "togg": 1,
  "tesla": 2,
  "byd": 3,
  "renault": 4,
  "hyundai": 5,
  "kia": 6,
  "bmw": 7,
  "mercedes-benz": 8,
  "volvo": 9,
  "audi": 10,
  "zeekr": 11,
};

const getPopularityScore = (brand: string) => {
  const key = brand.toLowerCase().trim();
  return BRAND_POPULARITY[key] ?? 100;
};

export default function VehicleHubClient({ vehicles, articles, testDriveVehicle }: VehicleHubClientProps) {
  // --- STATE FOR FILTER & DISCOVER ---
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedTrStatus, setSelectedTrStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // --- STATE FOR TABS ---
  const [bestSellersTab, setBestSellersTab] = useState<"monthly" | "yearly">("monthly");
  const [dailyReviewSubTab, setDailyReviewSubTab] = useState<"live" | "theory">("live");

  // --- STATE FOR COMPARISON ---
  const [compVeh1, setCompVeh1] = useState<string>("");
  const [compVeh2, setCompVeh2] = useState<string>("");

  // --- STATE FOR LIGHTBOX ---
  const [lightboxVehicle, setLightboxVehicle] = useState<Vehicle | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ESCAPE KEY LISTENER FOR LIGHTBOX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxVehicle(null);
      if (e.key === "ArrowRight" && lightboxVehicle) {
        const gallery = getVehicleGallery(lightboxVehicle);
        setLightboxIndex((prev) => (prev + 1) % gallery.length);
      }
      if (e.key === "ArrowLeft" && lightboxVehicle) {
        const gallery = getVehicleGallery(lightboxVehicle);
        setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxVehicle]);

  // Image Utilities
  const getVehicleDisplayImage = (v: Vehicle) => {
    const syncImages = (v.syncImages || []).filter(
      (img) => img.type !== "ignored" && img.type !== "deleted"
    );
    if (syncImages.length > 0) {
      const primary = syncImages.find((img) => img.isPrimary);
      if (primary) return primary.url;
      return syncImages[0].url;
    }
    return v.image || "/arac-placeholder.svg";
  };

  const getVehicleGallery = (v: Vehicle): string[] => {
    const syncImages = (v.syncImages || []).filter(
      (img) => img.type !== "ignored" && img.type !== "deleted"
    );
    if (syncImages.length > 0) {
      const primary = syncImages.find((img) => img.isPrimary);
      const remaining = syncImages.filter((img) => img !== primary).map((img) => img.url);
      if (primary) return [primary.url, ...remaining];
      return syncImages.map((img) => img.url);
    }
    return [v.image, ...(v.images || [])].filter(Boolean);
  };

  // Sort and Filter Logic
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const scoreA = getPopularityScore(a.brand);
    const scoreB = getPopularityScore(b.brand);
    if (scoreA !== scoreB) return scoreA - scoreB;
    const brandComp = a.brand.localeCompare(b.brand);
    if (brandComp !== 0) return brandComp;
    return a.model.localeCompare(b.model);
  });

  const filteredVehicles = sortedVehicles.filter((v) => {
    const matchesBrand = !selectedBrand || v.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSegment = !selectedSegment || v.segment.toLowerCase() === selectedSegment.toLowerCase();
    const matchesBodyType = !selectedBodyType || v.bodyType.toLowerCase() === selectedBodyType.toLowerCase();
    const matchesSearch = !searchQuery || 
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Ingest status filter
    if (selectedTrStatus === "tr_var") {
      return matchesBrand && matchesSegment && matchesBodyType && matchesSearch && 
        (v.marketStatus === "TR_YAYINDA" || v.marketStatus === "TR_YAKINDA");
    } else if (selectedTrStatus === "tr_yok") {
      return matchesBrand && matchesSegment && matchesBodyType && matchesSearch && 
        v.marketStatus === "TR_YOK";
    }
    
    return matchesBrand && matchesSegment && matchesBodyType && matchesSearch;
  });

  // Distinct Lists
  const distinctBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort((a, b) => {
    const scoreA = getPopularityScore(a);
    const scoreB = getPopularityScore(b);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.localeCompare(b);
  });
  const distinctSegments = Array.from(new Set(vehicles.map((v) => v.segment))).sort();
  const distinctBodyTypes = Array.from(new Set(vehicles.map((v) => v.bodyType))).sort();

  // Daily review selection (Determinisik)
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  const dailyVehicle = sortedVehicles.length > 0 
    ? sortedVehicles[dayIndex % sortedVehicles.length] 
    : null;

  // Segment Champions (Computed globally from all vehicles)
  const getChampions = (list: Vehicle[]) => {
    if (list.length === 0) return { cheapest: null, longest: null, fastest: null };
    const cheapest = [...list].sort((a, b) => a.price - b.price)[0];
    const longest = [...list].sort((a, b) => b.rangeKm - a.rangeKm)[0];
    const fastest = [...list].sort((a, b) => a.acceleration - b.acceleration)[0];
    return { cheapest, longest, fastest };
  };
  const champions = getChampions(sortedVehicles);

  // Top Rated Models (Rating exists, computed globally)
  const topRated = [...sortedVehicles]
    .filter((v) => v.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8);

  const fallbackBestSellers = sortedVehicles
    .filter((v) => v.marketStatus === "TR_YAYINDA" || v.marketStatus === "TR_YAKINDA")
    .slice(0, 5);

  const veh1 = vehicles.find((v) => v.id === compVeh1);
  const veh2 = vehicles.find((v) => v.id === compVeh2);

  return (
    <div className="flex flex-col gap-8 px-3 sm:px-0">
      
      {/* 1. ÜST MARKA LOGO BANDI */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-black tracking-wider text-neutral-400 uppercase">
          TÜM MARKALAR ({distinctBrands.length})
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-200">
          <button
            onClick={() => setSelectedBrand("")}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase transition shrink-0 ${
              selectedBrand === "" 
                ? "bg-teal-700 text-white" 
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            TÜMÜ
          </button>
          {distinctBrands.map((brandName) => {
            const slugKey = brandName.toLowerCase().trim().replace(/\s+/g, '-');
            const config = (BRANDS as any)[slugKey] || null;
            const hasLogo = config && config.logo;

            return (
              <button
                key={brandName}
                onClick={() => setSelectedBrand(brandName)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition shrink-0 ${
                  selectedBrand === brandName
                    ? "border-teal-700 bg-teal-50 text-teal-800"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {hasLogo ? (
                  <img
                    src={config.logo}
                    alt={brandName}
                    className="h-4 w-auto max-w-[20px] object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="text-xs font-black tracking-wide uppercase">{brandName}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. GRID LAYOUT (LEFT COLUMN: GÜNLÜK EV İNCELEMESİ, RIGHT COLUMN: BU AY EN ÇOK SATANLAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: GÜNLÜK EV İNCELEMESİ (lg:col-span-8) */}
        <section className="lg:col-span-8 flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="flex flex-col border-b border-neutral-100 bg-neutral-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-volt text-black font-black">★</span>
              <div>
                <h2 className="text-sm font-black tracking-widest text-neutral-800 uppercase">GÜNLÜK EV İNCELEMESİ</h2>
                <p className="text-[10px] text-neutral-400 font-bold">Bugünün Seçilen Modeli Canlı Verilerle Yayında</p>
              </div>
            </div>
          </div>

          {(() => {
            const v = dailyVehicle;
            if (!v) return <div className="p-8 text-center text-xs text-neutral-500">İçerik bulunmamaktadır.</div>;
            return (
              <div className="grid grid-cols-1 md:grid-cols-12 bg-neutral-900 text-white flex-1 min-h-[350px]">
                <div className="relative aspect-[16/9] md:aspect-auto md:col-span-7 bg-neutral-950 overflow-hidden">
                  <Image
                    src={getVehicleDisplayImage(v)}
                    alt={`${v.brand} ${v.model}`}
                    fill
                    className="object-cover opacity-90 transition duration-300 hover:opacity-100 hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-volt">
                      {v.segment} Segment · {v.bodyType}
                    </span>
                    <h3 className="text-2xl font-black leading-tight">{v.brand} {v.model}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-lg font-black text-volt">{formatTL(v.price)}</span>
                      <Link
                        href={`/araclar/${v.slug}`}
                        className="rounded bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[10px] font-black transition border border-white/10 text-volt"
                      >
                        DETAYLI RAPOR →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:col-span-5 flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-[10px] font-black text-neutral-400 tracking-wider">TEKNİK TELEMETRİ</span>
                      <div className="flex bg-neutral-950 p-0.5 rounded border border-neutral-800">
                        <button
                          onClick={() => setDailyReviewSubTab("live")}
                          className={`rounded px-2 py-0.5 text-[9px] font-black transition ${
                            dailyReviewSubTab === "live" ? "bg-volt text-black" : "text-neutral-400"
                          }`}
                        >
                          CANLI
                        </button>
                        <button
                          onClick={() => setDailyReviewSubTab("theory")}
                          className={`rounded px-2 py-0.5 text-[9px] font-black transition ${
                            dailyReviewSubTab === "theory" ? "bg-volt text-black" : "text-neutral-400"
                          }`}
                        >
                          TEORİK
                        </button>
                      </div>
                    </div>

                    {dailyReviewSubTab === "live" ? (
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="rounded bg-neutral-950 p-2.5 border border-neutral-800 flex flex-col">
                          <span className="text-[8px] font-black text-neutral-500 uppercase">SOH SAĞLIĞI</span>
                          <span className="text-base font-black text-volt mt-0.5">%97.8</span>
                        </div>
                        <div className="rounded bg-neutral-950 p-2.5 border border-neutral-800 flex flex-col">
                          <span className="text-[8px] font-black text-neutral-500 uppercase">TEST MENZİLİ</span>
                          <span className="text-base font-black text-white mt-0.5">{Math.round(v.rangeKm * 0.88)} km</span>
                        </div>
                        <div className="rounded bg-neutral-950 p-2.5 border border-neutral-800 flex flex-col">
                          <span className="text-[8px] font-black text-neutral-500 uppercase">GERÇEK DC ŞARJ</span>
                          <span className="text-base font-black text-white mt-0.5">{v.dcChargeKw ? `${v.dcChargeKw} kW` : "150 kW"}</span>
                        </div>
                        <div className="rounded bg-neutral-950 p-2.5 border border-neutral-800 flex flex-col">
                          <span className="text-[8px] font-black text-neutral-500 uppercase">VoltScore GÜVEN</span>
                          <span className="text-base font-black text-white mt-0.5">{v.rating ? Math.round(v.rating * 20) : 85}/100</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="bg-neutral-950 p-1.5 rounded">
                            <span className="text-[8px] text-neutral-500 uppercase block">WLTP</span>
                            <span className="text-xs font-black text-volt">{v.rangeKm} km</span>
                          </div>
                          <div className="bg-neutral-950 p-1.5 rounded">
                            <span className="text-[8px] text-neutral-500 uppercase block">Batarya</span>
                            <span className="text-xs font-black text-white">{v.batteryKwh} kWh</span>
                          </div>
                          <div className="bg-neutral-950 p-1.5 rounded">
                            <span className="text-[8px] text-neutral-500 uppercase block">0-100</span>
                            <span className="text-xs font-black text-white">{v.acceleration}s</span>
                          </div>
                        </div>
                        <div className="text-xs mt-1 space-y-1.5 text-[11px]">
                          <span className="text-[9px] font-black text-volt uppercase tracking-wider block">✓ SEÇİLEN ARTILAR</span>
                          <ul className="list-disc list-inside text-neutral-300 space-y-0.5">
                            {v.pros.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                            {v.pros.length === 0 && <li>Yüksek şarj kararlılığı</li>}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* RIGHT COLUMN: BU AY EN ÇOK SATANLAR (lg:col-span-4) */}
        <section className="lg:col-span-4 flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-black text-neutral-900">EN ÇOK SATANLAR</h2>
              <p className="text-[10px] font-bold text-neutral-400">Türkiye Elektrikli Araç Tescilleri</p>
            </div>
            <div className="flex rounded bg-neutral-100 p-0.5">
              <button
                onClick={() => setBestSellersTab("monthly")}
                className={`rounded px-2.5 py-0.5 text-[10px] font-black uppercase transition ${
                  bestSellersTab === "monthly" ? "bg-white text-teal-800 shadow-sm" : "text-neutral-500"
                }`}
              >
                AYLIK
              </button>
              <button
                onClick={() => setBestSellersTab("yearly")}
                className={`rounded px-2.5 py-0.5 text-[10px] font-black uppercase transition ${
                  bestSellersTab === "yearly" ? "bg-white text-teal-800 shadow-sm" : "text-neutral-500"
                }`}
              >
                YILLIK
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="divide-y divide-neutral-100">
              {fallbackBestSellers.map((v, index) => (
                <div key={v.id} className="flex items-center gap-3 py-2 text-xs hover:bg-neutral-50 rounded px-1 transition">
                  <span className="w-5 font-black text-neutral-400 text-center">#{index + 1}</span>
                  <div className="relative h-8 w-12 rounded overflow-hidden border border-neutral-200 bg-neutral-50 shrink-0">
                    <Image
                      src={getVehicleDisplayImage(v)}
                      alt={`${v.brand} ${v.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/araclar/${v.slug}`} className="block font-black text-neutral-900 truncate hover:text-teal-700">
                      {v.brand} {v.model}
                    </Link>
                    <span className="text-[9px] text-neutral-400 uppercase font-bold">{v.segment} · {v.bodyType}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-neutral-500 block text-[10px]">Tescil Bekliyor</span>
                    <span className="text-[9px] text-neutral-400">0 adet</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* 3. ARAÇLARI KEŞFET (SIDEBAR FILTERS + SINGLE UNIFIED GRID OF ALL VEHICLES SORTED BY POPULARITY) */}
      <section className="flex flex-col gap-6 lg:flex-row border-t border-neutral-150 pt-8">
        
        {/* Mobile Filter Toggle Button */}
        <button 
          onClick={() => setIsFilterOpenMobile(!isFilterOpenMobile)} 
          className="w-full bg-teal-700 text-white py-2.5 rounded font-black text-xs uppercase lg:hidden flex items-center justify-center gap-2"
        >
          {isFilterOpenMobile ? "FİLTRELERİ GİZLE ▲" : "FİLTRELERİ GÖSTER ▼"}
        </button>

        {/* Sidebar Filters Panel */}
        <aside className={`${isFilterOpenMobile ? "flex" : "hidden"} lg:flex w-full shrink-0 lg:w-[260px] flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm h-fit lg:sticky lg:top-4 z-10`}>
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wide">FİLTRELER</h3>
            <button 
              onClick={() => {
                setSelectedBrand("");
                setSelectedSegment("");
                setSelectedBodyType("");
                setSelectedTrStatus("");
                setSearchQuery("");
              }}
              className="text-[11px] font-black text-teal-700 hover:underline"
            >
              TEMİZLE
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Araç Ara</span>
            <input
              type="text"
              placeholder="Marka veya model yazın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-teal-600 bg-white text-neutral-800"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Marka</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Tümü</option>
              {distinctBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Segment</span>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Tümü</option>
              {distinctSegments.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Kasa Tipi</span>
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Tümü</option>
              {distinctBodyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Bulunurluk</span>
            <select
              value={selectedTrStatus}
              onChange={(e) => setSelectedTrStatus(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Tümü</option>
              <option value="tr_var">Türkiye'de Var</option>
              <option value="tr_yok">Türkiye'de Yok</option>
            </select>
          </div>
        </aside>

        {/* Single Unified Grid of All Vehicles */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <h2 className="text-base font-black text-neutral-800 border-b border-neutral-150 pb-2.5 uppercase tracking-wide flex items-center justify-between">
            <span>TÜM ELEKTRİKLİ MODELLER ({filteredVehicles.length})</span>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-pulse"></span>
          </h2>
          
          {filteredVehicles.length === 0 ? (
            <p className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-100 rounded-lg">
              Filtrelerinize uygun araç bulunamadı.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVehicles.map((v) => (
                <VehicleCardItem 
                  key={v.id} 
                  vehicle={v} 
                  displayImage={getVehicleDisplayImage(v)}
                  onGalleryClick={() => {
                    setLightboxVehicle(v);
                    setLightboxIndex(0);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SEGMENT ŞAMPİYONLARI */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-black text-neutral-900">SEGMENT ŞAMPİYONLARI</h2>
          <p className="text-xs font-bold text-neutral-400">Kriter Bazında Sınıfının En İyileri</p>
        </div>

        {(!champions.cheapest && !champions.longest && !champions.fastest) ? (
          <p className="p-8 text-center text-xs text-neutral-500 mt-4">Kategoriye ait araç bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-5">
            {champions.cheapest && (
              <Link href={`/araclar/${champions.cheapest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                <span className="w-fit rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                  EN UYGUN FİYATLI
                </span>
                <span className="text-base font-black text-neutral-900">{champions.cheapest.brand} {champions.cheapest.model}</span>
                <span className="text-xl font-black text-teal-800">{formatTL(champions.cheapest.price)}</span>
                <span className="text-[10px] text-neutral-500">{champions.cheapest.segment} · {champions.cheapest.batteryKwh} kWh</span>
              </Link>
            )}
            {champions.longest && (
              <Link href={`/araclar/${champions.longest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                <span className="w-fit rounded bg-sky-700 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                  EN UZUN MENZİL
                </span>
                <span className="text-base font-black text-neutral-900">{champions.longest.brand} {champions.longest.model}</span>
                <span className="text-xl font-black text-teal-800">{champions.longest.rangeKm} km</span>
                <span className="text-[10px] text-neutral-500">{champions.longest.segment} · {champions.longest.batteryKwh} kWh</span>
              </Link>
            )}
            {champions.fastest && (
              <Link href={`/araclar/${champions.fastest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                <span className="w-fit rounded bg-volt px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
                  EN HIZLI IVMELENEN
                </span>
                <span className="text-base font-black text-neutral-900">{champions.fastest.brand} {champions.fastest.model}</span>
                <span className="text-xl font-black text-teal-800">0-100: {champions.fastest.acceleration} sn</span>
                <span className="text-[10px] text-neutral-500">{champions.fastest.segment} · {champions.fastest.batteryKwh} kWh</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* 5. EN YÜKSEK PUANLI MODELLER */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-black text-neutral-900">EN YÜKSEK PUANLI MODELLER</h2>
          <p className="text-xs font-bold text-neutral-400">Editör Derecelendirmeleri</p>
        </div>

        {topRated.length === 0 ? (
          <p className="p-8 text-center text-xs text-neutral-500 mt-4">Henüz derecelendirilmiş model bulunmamaktadır.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-5">
            {topRated.map((v) => (
              <VehicleCardItem 
                key={v.id} 
                vehicle={v} 
                displayImage={getVehicleDisplayImage(v)}
                onGalleryClick={() => {
                  setLightboxVehicle(v);
                  setLightboxIndex(0);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. GÜNLÜK TEST SÜRÜŞÜ */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 uppercase tracking-wide">
          GÜNLÜK TEST SÜRÜŞÜ
        </h2>
        {testDriveVehicle ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded bg-neutral-100 md:col-span-5">
              <Image
                src={getVehicleDisplayImage(testDriveVehicle)}
                alt={`${testDriveVehicle.brand} ${testDriveVehicle.model}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="md:col-span-7 flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <span className="w-fit rounded bg-amber-500 px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-wider animate-pulse">
                  GÜNÜN TEST SÜRÜŞÜ
                </span>
                <h3 className="text-lg font-black text-neutral-900">{testDriveVehicle.brand} {testDriveVehicle.model} Test Sürüşü</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {testDriveVehicle.brand} {testDriveVehicle.model} modeliyle gerçekleştireceğimiz video incelemeli test sürüşü ve VoltScore derecelendirmesi yakında yayında olacaktır. Detaylar ve canlı ölçümler için takipte kalın.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-1.5 p-3.5 bg-neutral-50 rounded border border-neutral-150">
                <span className="text-[10px] font-black text-neutral-400 tracking-wider block">YOUTUBE VİDEO İNCELEME (YAKINDA)</span>
                <div className="aspect-[16/9] w-full bg-neutral-200 border border-neutral-200 rounded flex items-center justify-center text-xs font-bold text-neutral-400">
                  Yakında YouTube Kanalımızda
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-100 mt-4">Test sürüşü planlanan araç bulunmamaktadır.</p>
        )}
      </section>

      {/* 7. TEKNİK KARŞILAŞTIRMA MODÜLÜ */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 uppercase tracking-wide">
          TEKNİK KARŞILAŞTIRMA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">1. Araç</span>
            <select
              value={compVeh1}
              onChange={(e) => setCompVeh1(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2.5 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Araç Seçin</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">2. Araç</span>
            <select
              value={compVeh2}
              onChange={(e) => setCompVeh2(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2.5 text-xs outline-none bg-white text-neutral-800"
            >
              <option value="">Araç Seçin</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
              ))}
            </select>
          </div>
        </div>

        {veh1 || veh2 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 font-black text-neutral-400 bg-neutral-50">
                  <th className="py-2 px-3">TEKNİK ÖZELLİK</th>
                  <th className="py-2 px-3">{veh1 ? `${veh1.brand} ${veh1.model}` : "Seçilmedi"}</th>
                  <th className="py-2 px-3">{veh2 ? `${veh2.brand} ${veh2.model}` : "Seçilmedi"}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Batarya Kapasitesi</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.batteryKwh} kWh` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.batteryKwh} kWh` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Menzil (WLTP)</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.rangeKm} km` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.rangeKm} km` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Motor Gücü</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.motorPowerHp} HP / ${veh1.motorPowerKw} kW` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.motorPowerHp} HP / ${veh2.motorPowerKw} kW` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">0-100 km/s İvmelenme</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.acceleration} sn` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.acceleration} sn` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Maksimum Hız</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.topSpeed} km/s` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.topSpeed} km/s` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Ortalama Tüketim</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.consumption} kWh/100km` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.consumption} kWh/100km` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Çekiş Tipi</td>
                  <td className="py-2 px-3">{veh1 ? veh1.driveType : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? veh2.driveType : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Segment / Gövde</td>
                  <td className="py-2 px-3">{veh1 ? `${veh1.segment} / ${veh1.bodyType}` : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? `${veh2.segment} / ${veh2.bodyType}` : "—"}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 px-3 font-bold text-neutral-500">Hızlı Şarj (DC) Gücü</td>
                  <td className="py-2 px-3">{veh1 ? (veh1.dcChargeKw ? `${veh1.dcChargeKw} kW` : "Veri yok") : "—"}</td>
                  <td className="py-2 px-3">{veh2 ? (veh2.dcChargeKw ? `${veh2.dcChargeKw} kW` : "Veri yok") : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xs text-neutral-400 py-4 bg-neutral-50 rounded">Karşılaştırmak istediğiniz araçları yukarıdan seçin.</p>
        )}
      </section>

      {/* 8. İNCELEMELER & YAZILAR */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wide">
            EDİTÖR İNCELEMELERİ &amp; YAZILARI
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
            {articles.slice(0, 3).map((a) => (
              <Link key={a.id} href={`/haber/${a.slug}`} className="flex flex-col gap-3 group">
                <div className="relative aspect-[16/10] overflow-hidden rounded bg-neutral-100">
                  <Image
                    src={a.image || "/arac-placeholder.svg"}
                    alt={a.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-black text-neutral-900 leading-snug group-hover:text-teal-700 transition">
                    {a.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{a.spot}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-100 mt-4">Kategoriye ait incelenmiş içerik bulunmamaktadır.</p>
        )}
      </section>

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxVehicle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none"
          onClick={() => setLightboxVehicle(null)}
        >
          <button 
            onClick={() => setLightboxVehicle(null)}
            className="absolute right-4 top-4 z-50 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconClose className="h-5 w-5" />
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              const gallery = getVehicleGallery(lightboxVehicle);
              setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
            }}
            className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconChevronLeft className="h-6 w-6" />
          </button>

          <div 
            className="relative max-h-[85vh] max-w-[90vw] aspect-[16/10] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getVehicleGallery(lightboxVehicle)[lightboxIndex]}
              alt={`${lightboxVehicle.brand} ${lightboxVehicle.model}`}
              fill
              className="object-contain"
              priority
              loading="eager"
            />
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-neutral-900/80 px-3 py-1 text-xs text-white">
              {lightboxIndex + 1} / {getVehicleGallery(lightboxVehicle).length}
            </div>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              const gallery = getVehicleGallery(lightboxVehicle);
              setLightboxIndex((prev) => (prev + 1) % gallery.length);
            }}
            className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT FOR COMPACT VEHICLE CARD ---
interface VehicleCardItemProps {
  vehicle: Vehicle;
  displayImage: string;
  onGalleryClick: () => void;
}

function VehicleCardItem({ vehicle, displayImage, onGalleryClick }: VehicleCardItemProps) {
  const isTr = vehicle.marketStatus === "TR_YAYINDA" || vehicle.marketStatus === "TR_YAKINDA";
  const slugKey = vehicle.brand.toLowerCase().trim().replace(/\s+/g, '-');
  const brandConfig = (BRANDS as any)[slugKey] || null;
  const hasBrandLogo = brandConfig && brandConfig.logo;

  const [imgSrc, setImgSrc] = useState(displayImage);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-neutral-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width:640px) 50vw, 280px"
          className="object-cover transition duration-300 group-hover:scale-105 cursor-pointer"
          onClick={onGalleryClick}
          onError={() => setImgSrc("/arac-placeholder.svg")}
        />
        <span className="absolute left-1.5 top-1.5 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[9px] font-black text-white uppercase">
          {vehicle.segment}
        </span>
        <span className={`absolute right-1.5 bottom-1.5 rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white ${isTr ? "bg-teal-600" : "bg-neutral-500"}`}>
          {isTr ? "TR'DE VAR" : "TR'DE YOK"}
        </span>
        {vehicle.rating != null && (
          <span className="absolute right-1.5 top-1.5 rounded bg-volt px-1.5 py-0.5 text-[9px] font-black text-white">
            ★ {vehicle.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/araclar/${vehicle.slug}`} className="block">
          <h3 className="text-xs font-black leading-tight text-neutral-900 group-hover:text-teal-700 transition flex items-center gap-1.5">
            {hasBrandLogo && (
              <img
                src={brandConfig.logo}
                alt={vehicle.brand}
                className="h-3.5 w-auto max-w-[15px] object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span>{vehicle.brand} <span className="font-bold text-neutral-500">{vehicle.model}</span></span>
          </h3>
        </Link>

        {/* Dynamic Specifications Grid */}
        <div className="grid grid-cols-3 gap-1 border-y border-neutral-100 py-1.5 text-center text-[10px]">
          <div className="flex flex-col">
            <span className="font-black text-neutral-800">{vehicle.rangeKm || "—"}</span>
            <span className="text-[8px] text-neutral-400">km</span>
          </div>
          <div className="flex flex-col border-x border-neutral-100">
            <span className="font-black text-neutral-800">{vehicle.batteryKwh || "—"}</span>
            <span className="text-[8px] text-neutral-400">kWh</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-neutral-800">{vehicle.motorPowerHp || "—"}</span>
            <span className="text-[8px] text-neutral-400">HP</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between text-xs font-black">
          <span className="text-teal-700">{formatTL(vehicle.price)}</span>
          <span className="text-[9px] text-neutral-500">0-100: {vehicle.acceleration || "—"}s</span>
        </div>
      </div>
    </article>
  );
}
