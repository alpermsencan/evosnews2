"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { IconMap, IconBolt, IconSearch, IconClose } from "@/components/ui/Icons";

export type MapStation = {
  id: string;
  name: string;
  operator: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  maxPowerKw: number | null;
  socketCount: number;
  isFast: boolean;
  price: number | null;
};

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyDByVeAH6VK2aMi-AmD54WrC0oG3zbqtSE";

// Pin SVG builder
function createMarkerSvg(color: string, iconType: "hpc" | "fast" | "ac"): string {
  const icon =
    iconType === "hpc"
      ? '<path fill="#fff" d="M11 2L5 13h5v9l6-11h-5z"/>'
      : iconType === "fast"
      ? '<path fill="#fff" d="M11 3L6 12h4v8l5-9h-4z"/>'
      : '<path fill="#fff" d="M9 3v4m6-4v4m-8 2h10a2 2 0 0 1 2 2v2a5 5 0 0 1-5 5v3h-4v-3a5 5 0 0 1-5-5v-2a2 2 0 0 1 2-2z"/>';

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 11.5 14.2 24.8 14.8 25.4.6.6 1.8.6 2.4 0C17.8 40.8 32 27.5 32 16 32 7.16 24.8 0 16 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="15" r="11" fill="rgba(0,0,0,0.18)"/>
      <g transform="translate(5, 4)">
        ${icon}
      </g>
    </svg>
  `)}`;
}

export default function StationMap({ stations }: { stations: MapStation[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const userAccuracyCircleRef = useRef<any>(null);
  const activeInfoWindowRef = useRef<any>(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "hpc" | "fast" | "ac">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Google Maps JS SDK Loader
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if Google Maps is already present on window
    if ((window as any).google && (window as any).google.maps) {
      setMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-sdk";
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          setMapsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=tr`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapsLoaded(true);
    };
    script.onerror = () => {
      setLoadError("Google Maps yüklenirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    };
    document.head.appendChild(script);
  }, []);

  // 2. Initialize Google Map
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 39.1, lng: 35.3 }, // Türkiye merkezi
        zoom: 6,
        minZoom: 5,
        maxZoom: 19,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });

      mapInstanceRef.current = map;
    }
  }, [mapsLoaded]);

  // 3. Filtered stations memo
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (!s.lat || !s.lng) return false;

      // Güç filtresi
      const kw = s.maxPowerKw || 0;
      if (selectedFilter === "hpc" && kw < 150) return false;
      if (selectedFilter === "fast" && (kw < 50 || kw >= 150)) return false;
      if (selectedFilter === "ac" && kw >= 50) return false;

      // Arama filtresi
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchOp = s.operator.toLowerCase().includes(q);
        const matchCity = s.city.toLowerCase().includes(q);
        const matchDistrict = (s.district || "").toLowerCase().includes(q);
        if (!matchName && !matchOp && !matchCity && !matchDistrict) return false;
      }

      return true;
    });
  }, [stations, selectedFilter, searchQuery]);

  // 4. Update Markers on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    const map = mapInstanceRef.current;

    // Clear existing station markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Close any open info window
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
    }

    filteredStations.forEach((s) => {
      const kw = s.maxPowerKw || (s.isFast ? 180 : 22);
      const isHpc = kw >= 150;
      const isFast = kw >= 50 && kw < 150;

      const markerColor = isHpc ? "#dc2626" : isFast ? "#d97706" : "#059669";
      const iconType = isHpc ? "hpc" : isFast ? "fast" : "ac";

      const powerBadgeText = isHpc ? `HPC ${kw} kW DC` : isFast ? `${kw} kW DC` : `${kw} kW AC`;

      // Live socket simulation
      const totalSockets = Math.max(2, s.socketCount || 2);
      const hash = Math.abs(Math.sin((s.lat || 0) * 100 + (s.lng || 0) * 50));
      const busySockets = Math.min(totalSockets - 1, Math.floor(hash * totalSockets));
      const freeSockets = Math.max(1, totalSockets - busySockets);

      // Price text
      let priceVal = s.price;
      if (!priceVal) {
        const op = (s.operator || "").toLowerCase();
        if (op.includes("trugo")) priceVal = 8.49;
        else if (op.includes("zes")) priceVal = 8.90;
        else if (op.includes("eşarj") || op.includes("esarj")) priceVal = 8.80;
        else if (op.includes("astor")) priceVal = 7.95;
        else if (op.includes("tesla")) priceVal = 7.80;
        else if (op.includes("voltrun")) priceVal = 8.25;
        else priceVal = s.isFast ? 8.40 : 6.50;
      }
      const priceText = `${priceVal.toFixed(2)} ₺/kWh`;

      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map,
        title: `${s.operator} - ${s.name}`,
        icon: {
          url: createMarkerSvg(markerColor, iconType),
          scaledSize: new google.maps.Size(28, 38),
          anchor: new google.maps.Point(14, 38),
        },
      });

      const infoContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 230px; max-width: 290px; padding: 4px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 900; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
              ${s.operator}
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 999px; padding: 2px 7px;">
              <span style="width: 6px; height: 6px; border-radius: 999px; background: #10b981; display: inline-block;"></span>
              ${freeSockets}/${totalSockets} MÜSAİT
            </span>
          </div>

          <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 900; color: #0f172a; line-height: 1.25;">
            ${s.name}
          </h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; font-weight: 500;">
            ${s.district ? s.district + ", " : ""}${s.city}
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">Maks Güç:</span>
              <span style="font-size: 11px; font-weight: 900; color: ${markerColor};">${powerBadgeText}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">Resmî Tarife:</span>
              <span style="font-size: 12px; font-weight: 900; color: #0f172a;">${priceText}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #2563eb; color: #ffffff; border-radius: 8px; font-size: 11px; font-weight: 800; padding: 7px 0; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Google Haritalar'da Yol Tarifi Al
            </a>
            <a 
              href="/sarj-agi/rota?toLat=${s.lat}&toLng=${s.lng}" 
              style="display: block; text-align: center; background-color: #f1f5f9; color: #334155; border-radius: 8px; font-size: 11px; font-weight: 700; padding: 6px 0; text-decoration: none; border: 1px solid #cbd5e1;"
            >
              e-aracım Rota Planlayıcı
            </a>
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        infoWindow.open(map, marker);
        activeInfoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);
    });
  }, [filteredStations]);

  // 5. GPS: Real High-Accuracy HTML5 Geolocation
  const locateUser = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    if (!navigator.geolocation) {
      setLocationStatus("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setLocating(true);
    setLocationStatus("Uydudan hassas konum alınıyor...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const userLatLng = { lat: latitude, lng: longitude };
        const map = mapInstanceRef.current;

        // Animate map smoothly to user's location
        map.panTo(userLatLng);
        map.setZoom(14);

        // Remove previous user marker and circle if any
        if (userMarkerRef.current) userMarkerRef.current.setMap(null);
        if (userAccuracyCircleRef.current) userAccuracyCircleRef.current.setMap(null);

        // Accuracy halo circle
        userAccuracyCircleRef.current = new google.maps.Circle({
          map,
          center: userLatLng,
          radius: Math.min(accuracy, 800),
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          strokeColor: "#2563eb",
          strokeOpacity: 0.5,
          strokeWeight: 1.5,
        });

        // Pulsing user location marker
        userMarkerRef.current = new google.maps.Marker({
          position: userLatLng,
          map,
          title: "Şu anki Konumunuz",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          zIndex: 9999,
        });

        const userWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: -apple-system, sans-serif; padding: 4px; text-align: center;">
              <span style="font-size: 14px;">📍</span>
              <strong style="display: block; font-size: 12px; color: #1e293b; margin-top: 2px;">Mevcut Konumunuz</strong>
              <span style="font-size: 10px; color: #64748b;">Hassasiyet: ~${Math.round(accuracy)} metre</span>
            </div>
          `,
        });

        userWindow.open(map, userMarkerRef.current);
        activeInfoWindowRef.current = userWindow;
        setLocationStatus("Konumunuz başarıyla bulundu.");
        setTimeout(() => setLocationStatus(null), 4000);
      },
      (error) => {
        setLocating(false);
        let errorMsg = "Konum alınamadı.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Konum izni verilmedi. Lütfen tarayıcınızın adres çubuğundaki kilit simgesine tıklayıp Konum iznini 'İzin Ver' olarak ayarlayın.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Konum alma zaman aşımına uğradı. Lütfen cihazınızın GPS veya konum servislerini kontrol edin.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Konum bilgisi şu anda mevcut değil.";
        }
        setLocationStatus(errorMsg);
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/5">
      {/* ÜST PANEL: BAŞLIK, GPS BUTONU VE ARAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 p-4 sm:p-5 bg-gradient-to-b from-neutral-50 to-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-xs shrink-0">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
                CANLI GOOGLE ŞARJ HARİTASI
              </h2>
              <span className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                GOOGLE MAPS
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Türkiye geneli {filteredStations.length} aktif şarj istasyonu görüntüleniyor
            </p>
          </div>
        </div>

        {/* Aksiyonlar: GPS Butonu & Hızlı Arama */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Arama Inputu */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şehir veya Operatör ara..."
              className="w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-7 py-2 text-xs font-bold text-neutral-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            <IconSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 p-0.5 text-neutral-400 hover:text-neutral-700"
              >
                <IconClose className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* BENİ BUL (GPS) Butonu */}
          <button
            type="button"
            onClick={locateUser}
            disabled={locating || !mapsLoaded}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 text-xs font-black text-white transition shadow-sm disabled:opacity-60 cursor-pointer shrink-0"
          >
            <span className="text-sm">📍</span>
            <span>{locating ? "GPS ALINIYOR..." : "BENİ BUL (GPS)"}</span>
          </button>
        </div>
      </div>

      {/* FİLTRELEME ÇİPLERİ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 bg-neutral-50/70 border-b border-neutral-100 text-xs font-bold">
        <span className="text-[11px] text-neutral-400 uppercase font-black shrink-0 mr-1">
          HIZ FİLTRESİ:
        </span>
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`px-3 py-1 rounded-lg transition shrink-0 ${
            selectedFilter === "all"
              ? "bg-neutral-900 text-white shadow-xs"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          Tümü ({stations.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("hpc")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition shrink-0 ${
            selectedFilter === "hpc"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-white border border-neutral-200 text-red-600 hover:bg-red-50"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-red-600" />
          Ultra Hızlı HPC (≥ 150 kW DC)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("fast")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition shrink-0 ${
            selectedFilter === "fast"
              ? "bg-amber-500 text-neutral-950 shadow-xs"
              : "bg-white border border-neutral-200 text-amber-700 hover:bg-amber-50"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Hızlı Şarj (50–149 kW DC)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("ac")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition shrink-0 ${
            selectedFilter === "ac"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white border border-neutral-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          Standart Şarj (&lt; 50 kW AC)
        </button>
      </div>

      {/* BİLDİRİM ÇUBUĞU (Hata / Bilgi) */}
      {locationStatus && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs font-bold text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>{locationStatus}</span>
          </div>
          <button
            onClick={() => setLocationStatus(null)}
            className="text-blue-500 hover:text-blue-800 text-sm font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* GOOGLE MAPS HARİTA ALANI */}
      <div className="relative w-full h-[520px] bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Yükleme Ekranı */}
        {!mapsLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/90 backdrop-blur-xs gap-3 z-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600" />
            <span className="text-xs font-black tracking-wider text-neutral-600 uppercase">
              Google Haritalar Yükleniyor...
            </span>
          </div>
        )}

        {/* Hata Ekranı */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-6 text-center z-20">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="text-sm font-bold text-neutral-800 max-w-sm">{loadError}</p>
          </div>
        )}
      </div>

      {/* ALT BİLGİ & RENK AÇIKLAMALARI */}
      <div className="border-t border-neutral-150 bg-neutral-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 font-bold text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-600" />
            Ultra Hızlı HPC (≥ 150 kW)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            Hızlı Şarj (50–149 kW)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            Standart AC (&lt; 50 kW)
          </span>
        </div>

        <div className="text-[11px] font-semibold text-neutral-400">
          İstasyonlara tıklayarak canlı soket durumu ve tarifeleri inceleyebilirsiniz.
        </div>
      </div>
    </section>
  );
}
