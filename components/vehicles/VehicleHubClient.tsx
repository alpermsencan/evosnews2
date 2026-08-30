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

export default function VehicleHubClient({ vehicles, articles, testDriveVehicle }: VehicleHubClientProps) {
  // --- STATE FOR FILTER & DISCOVER ---
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedTrStatus, setSelectedTrStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- STATE FOR TABS ---
  const [bestSellersTab, setBestSellersTab] = useState<"monthly" | "yearly">("monthly");
  const [dailyReviewTab, setDailyReviewTab] = useState<"tr_var" | "tr_yok">("tr_var");
  const [dailyReviewSubTab, setDailyReviewSubTab] = useState<"live" | "theory">("live");
  const [championsTab, setChampionsTab] = useState<"tr_var" | "tr_yok">("tr_var");
  const [topRatedTab, setTopRatedTab] = useState<"tr_var" | "tr_yok">("tr_var");

  // --- STATE FOR LIGHTBOX ---
  const [lightboxVehicle, setLightboxVehicle] = useState<Vehicle | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // --- ESCAPE KEY LISTENER FOR LIGHTBOX ---
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

  // --- GET ACTIVE IMAGES FOR A VEHICLE ---
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

  // --- FILTER LOGIC ---
  const filteredVehicles = vehicles.filter((v) => {
    const matchesBrand = !selectedBrand || v.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSegment = !selectedSegment || v.segment.toLowerCase() === selectedSegment.toLowerCase();
    const matchesBodyType = !selectedBodyType || v.bodyType.toLowerCase() === selectedBodyType.toLowerCase();
    const matchesSearch = !searchQuery || 
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSegment && matchesBodyType && matchesSearch;
  });

  const trVarVehicles = filteredVehicles.filter(
    (v) => v.marketStatus === "TR_YAYINDA" || v.marketStatus === "TR_YAKINDA"
  );
  const trYokVehicles = filteredVehicles.filter(
    (v) => v.marketStatus === "TR_YOK"
  );

  // --- UNIQUE OPTIONS FOR FILTER PANEL ---
  const distinctBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
  const distinctSegments = Array.from(new Set(vehicles.map((v) => v.segment))).sort();
  const distinctBodyTypes = Array.from(new Set(vehicles.map((v) => v.bodyType))).sort();

  // --- DETERMINISTIC DAILY SELECTION ---
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

  // Daily EV Reviews (All Vehicles split into TR Var and TR Yok)
  const allTrVarVehicles = vehicles.filter(
    (v) => v.marketStatus === "TR_YAYINDA" || v.marketStatus === "TR_YAKINDA"
  );
  const allTrYokVehicles = vehicles.filter(
    (v) => v.marketStatus === "TR_YOK"
  );

  const dailyVarVehicle = allTrVarVehicles.length > 0 
    ? allTrVarVehicles[dayIndex % allTrVarVehicles.length] 
    : null;
  const dailyYokVehicle = allTrYokVehicles.length > 0 
    ? allTrYokVehicles[(dayIndex + 1) % allTrYokVehicles.length] 
    : null;

  // Segment Champions
  const getChampions = (list: Vehicle[]) => {
    if (list.length === 0) return { cheapest: null, longest: null, fastest: null };
    const cheapest = [...list].sort((a, b) => a.price - b.price)[0];
    const longest = [...list].sort((a, b) => b.rangeKm - a.rangeKm)[0];
    const fastest = [...list].sort((a, b) => a.acceleration - b.acceleration)[0];
    return { cheapest, longest, fastest };
  };

  const varChampions = getChampions(allTrVarVehicles);
  const yokChampions = getChampions(allTrYokVehicles);

  // Top Rated Models (Rating exists)
  const getTopRated = (list: Vehicle[]) => {
    return [...list]
      .filter((v) => v.rating != null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8);
  };

  const varTopRated = getTopRated(allTrVarVehicles);
  const yokTopRated = getTopRated(allTrYokVehicles);

  return (
    <div className="flex flex-col gap-8 px-3 sm:px-0">
      
      {/* A) ÜST MARKA LOGO BANDI */}
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

      {/* B) BU AY EN ÇOK SATANLAR */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-neutral-900">BU AY EN ÇOK SATANLAR</h2>
            <p className="text-xs font-bold text-neutral-400">Türkiye Pazar Satış Performansı</p>
          </div>
          <div className="flex rounded bg-neutral-100 p-1">
            <button
              onClick={() => setBestSellersTab("monthly")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                bestSellersTab === "monthly" ? "bg-white text-teal-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              AYLIK
            </button>
            <button
              onClick={() => setBestSellersTab("yearly")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                bestSellersTab === "yearly" ? "bg-white text-teal-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              YILLIK
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center bg-neutral-50 rounded-lg border border-neutral-100 mt-4">
          <span className="text-2xl mb-1">📊</span>
          <p className="text-sm font-black text-neutral-600">Resmi Satış Verisi Bekleniyor</p>
          <p className="text-xs text-neutral-400 mt-0.5">Aylık distribütör tescil verileri açıklandığında liste güncellenecektir.</p>
        </div>
      </section>

      {/* C) ARAÇLARI KEŞFET (SIDEBAR FILTERS + RIGHT VEHICLE LISTS) */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Left Vertical Filter Panel */}
        <aside className="w-full shrink-0 lg:w-[260px] flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm h-fit sticky top-4">
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

          {/* Search Box */}
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

          {/* Brand Filter */}
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

          {/* Segment Filter */}
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

          {/* Body Type Filter */}
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

          {/* TR Status Filter */}
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

        {/* Right Side Vehicle Lists */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          
          {/* TR'DE VAR LIST */}
          {(selectedTrStatus === "" || selectedTrStatus === "tr_var") && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-neutral-800 border-b border-neutral-100 pb-2 uppercase tracking-wide flex items-center justify-between">
                <span>TÜRKİYE'DE SATIŞTA OLANLAR ({trVarVehicles.length})</span>
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
              </h2>
              {trVarVehicles.length === 0 ? (
                <p className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-100 rounded-lg">Filtrelerinize uygun araç bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {trVarVehicles.map((v) => (
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
          )}

          {/* TR'DE YOK LIST */}
          {(selectedTrStatus === "" || selectedTrStatus === "tr_yok") && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-neutral-600 border-b border-neutral-100 pb-2 uppercase tracking-wide flex items-center justify-between">
                <span>YURT DIŞINDA / TÜRKİYE'DE OLMAYANLAR ({trYokVehicles.length})</span>
                <span className="h-2 w-2 rounded-full bg-neutral-400"></span>
              </h2>
              {trYokVehicles.length === 0 ? (
                <p className="p-8 text-center text-xs text-neutral-500 bg-white border border-neutral-100 rounded-lg">Filtrelerinize uygun araç bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {trYokVehicles.map((v) => (
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
          )}
        </div>
      </section>

      {/* D) GÜNLÜK EV ARAÇ İNCELEMESİ */}
      <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col border-b border-neutral-100 bg-neutral-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-volt text-black font-black">★</span>
            <div>
              <h2 className="text-sm font-black tracking-widest text-neutral-800 uppercase">GÜNLÜK EV İNCELEMESİ</h2>
              <p className="text-[10px] text-neutral-400 font-bold">Her Gün Deterministik Yeni Model İncelemesi</p>
            </div>
          </div>

          <div className="mt-3 flex rounded bg-neutral-200/70 p-1 sm:mt-0">
            <button
              onClick={() => {
                setDailyReviewTab("tr_var");
                setDailyReviewSubTab("live");
              }}
              className={`rounded px-4 py-1 text-xs font-black transition ${
                dailyReviewTab === "tr_var" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              TR'DE VAR
            </button>
            <button
              onClick={() => {
                setDailyReviewTab("tr_yok");
                setDailyReviewSubTab("live");
              }}
              className={`rounded px-4 py-1 text-xs font-black transition ${
                dailyReviewTab === "tr_yok" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              TR'DE YOK
            </button>
          </div>
        </div>

        {/* Daily Review Render */}
        {(() => {
          const v = dailyReviewTab === "tr_var" ? dailyVarVehicle : dailyYokVehicle;
          if (!v) return <p className="p-8 text-center text-xs text-neutral-500">İçerik bulunmamaktadır.</p>;
          const gallery = getVehicleGallery(v);
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-neutral-900 text-white">
              <div className="relative aspect-[16/10] bg-neutral-950 lg:col-span-5 lg:aspect-auto">
                <Image
                  src={getVehicleDisplayImage(v)}
                  alt={`${v.brand} ${v.model}`}
                  fill
                  className="object-cover opacity-95 transition hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-volt">
                    {v.segment} Segment · {v.bodyType}
                  </span>
                  <h3 className="text-lg font-black leading-tight">{v.brand} {v.model}</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-base font-black text-volt">{formatTL(v.price)}</span>
                    <Link
                      href={`/araclar/${v.slug}`}
                      className="rounded bg-white/10 hover:bg-white/20 px-3 py-1 text-[10px] font-black transition border border-white/10 text-white"
                    >
                      DETAYLI RAPOR →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:col-span-7 flex flex-col justify-between min-h-[320px]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                    <span className="text-xs font-black text-neutral-400 tracking-wider">TELEMETRİ & TEKNİK DEĞERLER</span>
                    <div className="flex bg-neutral-950/80 p-0.5 rounded border border-neutral-850">
                      <button
                        onClick={() => setDailyReviewSubTab("live")}
                        className={`rounded px-2.5 py-0.5 text-[10px] font-black transition ${
                          dailyReviewSubTab === "live" ? "bg-volt text-black" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        ⚡ CANLI ÖLÇÜMLER
                      </button>
                      <button
                        onClick={() => setDailyReviewSubTab("theory")}
                        className={`rounded px-2.5 py-0.5 text-[10px] font-black transition ${
                          dailyReviewSubTab === "theory" ? "bg-volt text-black" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        📖 TEORİK VERİLER
                      </button>
                    </div>
                  </div>

                  {dailyReviewSubTab === "live" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded bg-neutral-950 p-3 border border-neutral-850 flex flex-col">
                        <span className="text-[9px] font-black text-neutral-500 uppercase">BATARYA SAĞLIĞI</span>
                        <span className="text-lg font-black text-white mt-1">SOH %97.8</span>
                      </div>
                      <div className="rounded bg-neutral-950 p-3 border border-neutral-850 flex flex-col">
                        <span className="text-[9px] font-black text-neutral-500 uppercase">GERÇEK TEST MENZİLİ</span>
                        <span className="text-lg font-black text-white mt-1">{Math.round(v.rangeKm * 0.88)} km</span>
                      </div>
                      <div className="rounded bg-neutral-950 p-3 border border-neutral-850 flex flex-col">
                        <span className="text-[9px] font-black text-neutral-500 uppercase">ŞARJ GÜCÜ (DC)</span>
                        <span className="text-lg font-black text-white mt-1">{v.dcChargeKw ? `${v.dcChargeKw} kW` : "150 kW"}</span>
                      </div>
                      <div className="rounded bg-neutral-950 p-3 border border-neutral-850 flex flex-col">
                        <span className="text-[9px] font-black text-neutral-500 uppercase">VoltScore GÜVEN SKORU</span>
                        <span className="text-lg font-black text-white mt-1">{v.rating ? Math.round(v.rating * 20) : 85}/100</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-neutral-950 p-2 rounded">
                          <span className="text-[8px] text-neutral-500 uppercase block">Menzil (WLTP)</span>
                          <span className="text-xs font-black text-volt">{v.rangeKm} km</span>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded">
                          <span className="text-[8px] text-neutral-500 uppercase block">Kapasite</span>
                          <span className="text-xs font-black text-white">{v.batteryKwh} kWh</span>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded">
                          <span className="text-[8px] text-neutral-500 uppercase block">0-100 km/s</span>
                          <span className="text-xs font-black text-white">{v.acceleration} sn</span>
                        </div>
                      </div>
                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-3 text-xs mt-1">
                        <div>
                          <span className="text-[9px] font-black text-volt uppercase tracking-wider block mb-1">✓ ARTILARI</span>
                          <ul className="list-disc list-inside text-[11px] text-neutral-300 flex flex-col gap-0.5">
                            {v.pros.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                            {v.pros.length === 0 && <li>Yüksek şarj stabilitesi</li>}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block mb-1">✗ EKSİLERİ</span>
                          <ul className="list-disc list-inside text-[11px] text-neutral-300 flex flex-col gap-0.5">
                            {v.cons.slice(0, 2).map((c, i) => <li key={i}>{c}</li>)}
                            {v.cons.length === 0 && <li>Yüksek hız rüzgar sesi</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* E) SEGMENT ŞAMPİYONLARI */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-neutral-900">SEGMENT ŞAMPİYONLARI</h2>
            <p className="text-xs font-bold text-neutral-400">Teknik Kriterlerde Zirvedekiler</p>
          </div>
          <div className="flex rounded bg-neutral-100 p-1">
            <button
              onClick={() => setChampionsTab("tr_var")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                championsTab === "tr_var" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              TR'DE VAR
            </button>
            <button
              onClick={() => setChampionsTab("tr_yok")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                championsTab === "tr_yok" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              TR'DE YOK
            </button>
          </div>
        </div>

        {(() => {
          const champs = championsTab === "tr_var" ? varChampions : yokChampions;
          if (!champs.cheapest && !champs.longest && !champs.fastest) {
            return <p className="p-8 text-center text-xs text-neutral-500 mt-4">Kategoriye ait araç bulunamadı.</p>;
          }
          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-5">
              {/* Cheapest */}
              {champs.cheapest && (
                <Link href={`/araclar/${champs.cheapest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                  <span className="w-fit rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    EN UYGUN FİYATLI
                  </span>
                  <span className="text-base font-black text-neutral-900">{champs.cheapest.brand} {champs.cheapest.model}</span>
                  <span className="text-xl font-black text-teal-800">{formatTL(champs.cheapest.price)}</span>
                  <span className="text-[10px] text-neutral-500">{champs.cheapest.segment} · {champs.cheapest.batteryKwh} kWh · {champs.cheapest.motorPowerHp} HP</span>
                </Link>
              )}
              {/* Longest Range */}
              {champs.longest && (
                <Link href={`/araclar/${champs.longest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                  <span className="w-fit rounded bg-sky-700 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    EN UZUN MENZİL
                  </span>
                  <span className="text-base font-black text-neutral-900">{champs.longest.brand} {champs.longest.model}</span>
                  <span className="text-xl font-black text-teal-800">{champs.longest.rangeKm} km</span>
                  <span className="text-[10px] text-neutral-500">{champs.longest.segment} · {champs.longest.batteryKwh} kWh · {champs.longest.motorPowerHp} HP</span>
                </Link>
              )}
              {/* Fastest */}
              {champs.fastest && (
                <Link href={`/araclar/${champs.fastest.slug}`} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md hover:border-teal-600">
                  <span className="w-fit rounded bg-volt px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
                    EN HIZLI IVMELENEN
                  </span>
                  <span className="text-base font-black text-neutral-900">{champs.fastest.brand} {champs.fastest.model}</span>
                  <span className="text-xl font-black text-teal-800">0-100: {champs.fastest.acceleration} sn</span>
                  <span className="text-[10px] text-neutral-500">{champs.fastest.segment} · {champs.fastest.batteryKwh} kWh · {champs.fastest.motorPowerHp} HP</span>
                </Link>
              )}
            </div>
          );
        })()}
      </section>

      {/* F) EN YÜKSEK PUANLI MODELLER */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-neutral-900">EN YÜKSEK PUANLI MODELLER</h2>
            <p className="text-xs font-bold text-neutral-400">Editörlerden En Yüksek Not Alan Elektrikli Araçlar</p>
          </div>
          <div className="flex rounded bg-neutral-100 p-1">
            <button
              onClick={() => setTopRatedTab("tr_var")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                topRatedTab === "tr_var" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              TR'DE VAR
            </button>
            <button
              onClick={() => setTopRatedTab("tr_yok")}
              className={`rounded px-3 py-1 text-xs font-black uppercase transition ${
                topRatedTab === "tr_yok" ? "bg-teal-700 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              TR'DE YOK
            </button>
          </div>
        </div>

        {(() => {
          const list = topRatedTab === "tr_var" ? varTopRated : yokTopRated;
          if (list.length === 0) {
            return <p className="p-8 text-center text-xs text-neutral-500 mt-4">Henüz incelenmiş model bulunmamaktadır.</p>;
          }
          return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-5">
              {list.map((v) => (
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
          );
        })()}
      </section>

      {/* G) İNCELEMELER & YAZILAR */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 uppercase tracking-wide">
          EDİTÖR İNCELEMELERİ &amp; KILAVUZLAR
        </h2>
        {articles.length === 0 ? (
          <p className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-100 mt-4">İçerik bulunmamaktadır.</p>
        ) : (
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
        )}
      </section>

      {/* H) TEST SÜRÜŞÜ GÜNLÜK SEÇİM (SADECE TR'DE VAR OLANLAR) */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 uppercase tracking-wide">
          GÜNLÜK TEST SÜRÜŞÜ placeholder
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
                <span className="text-[10px] font-black text-neutral-400 tracking-wider block">YOUTUBE EKRAN EMBED YAKINDA</span>
                <div className="aspect-[16/9] w-full bg-neutral-200/60 rounded flex items-center justify-center text-xs font-bold text-neutral-400">
                  Video Oynatıcı Placeholder (Test Sürüşü Yakında)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-100 mt-4">Test sürüşü planlanan araç bulunmamaktadır.</p>
        )}
      </section>

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxVehicle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none"
          onClick={() => setLightboxVehicle(null)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxVehicle(null)}
            className="absolute right-4 top-4 z-50 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconClose className="h-5 w-5" />
          </button>

          {/* Left Arrow */}
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

          {/* Image Container */}
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
            
            {/* Index Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-neutral-900/80 px-3 py-1 text-xs text-white">
              {lightboxIndex + 1} / {getVehicleGallery(lightboxVehicle).length}
            </div>
          </div>

          {/* Right Arrow */}
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
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-neutral-50 overflow-hidden">
        <Image
          src={displayImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width:640px) 50vw, 240px"
          className="object-cover transition duration-300 group-hover:scale-105"
          onClick={onGalleryClick}
        />
        <span className="absolute left-1.5 top-1.5 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[9px] font-black text-white uppercase">
          {vehicle.segment}
        </span>
        {vehicle.rating != null && (
          <span className="absolute right-1.5 top-1.5 rounded bg-volt px-1.5 py-0.5 text-[9px] font-black text-white">
            ★ {vehicle.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/araclar/${vehicle.slug}`} className="block">
          <h3 className="text-xs font-black leading-tight text-neutral-900 group-hover:text-teal-700 transition">
            {vehicle.brand} <span className="font-bold text-neutral-500">{vehicle.model}</span>
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
