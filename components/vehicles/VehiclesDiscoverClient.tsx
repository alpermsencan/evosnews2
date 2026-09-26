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

interface VehiclesDiscoverClientProps {
  vehicles: Vehicle[];
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

export default function VehiclesDiscoverClient({ vehicles }: VehiclesDiscoverClientProps) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedTrStatus, setSelectedTrStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // Lightbox State
  const [lightboxVehicle, setLightboxVehicle] = useState<Vehicle | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Escape key for Lightbox
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
    const ratA = a.rating ?? 0;
    const ratB = b.rating ?? 0;
    if (ratB !== ratA) return ratB - ratA;
    return b.rangeKm - a.rangeKm;
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

  return (
    <div className="flex flex-col gap-6">
      
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

      {/* 2. MAIN LAYOUT (LEFT SIDEBAR FILTER PANEL + RIGHT COLUMN VEHICLE LIST) */}
      <div className="flex flex-col gap-6 lg:flex-row">
        
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
              placeholder="Marka veya model..."
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

      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxVehicle && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 select-none"
          onClick={() => setLightboxVehicle(null)}
        >
          <button 
            onClick={() => setLightboxVehicle(null)}
            className="absolute right-4 top-4 z-[110] rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconClose className="h-5 w-5" />
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              const gallery = getVehicleGallery(lightboxVehicle);
              setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
            }}
            className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
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
            className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
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
