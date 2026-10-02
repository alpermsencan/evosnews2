"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { IconMap, IconBolt, IconSearch, IconClose } from "@/components/ui/Icons";
import { FALLBACK_STATIONS } from "@/lib/stations-fallback";

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
  distanceKm?: number;
};

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyDByVeAH6VK2aMi-AmD54WrC0oG3zbqtSE";

// Operatör Listesi
const OPERATORS = [
  "Tümü",
  "Trugo",
  "ZES",
  "Eşarj",
  "Astor",
  "Tesla",
  "Voltrun",
  "Sharz",
];

// İki koordinat arası km mesafe (Haversine formülü)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya yarıçapı km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Babuba tarzı SVG pin ikonu
function createMarkerSvg(color: string, isHpc: boolean): string {
  const icon = isHpc
    ? '<path fill="#fff" d="M12 2L6 13h5v9l7-11h-6z"/>'
    : '<path fill="#fff" d="M11 3L6 12h4v8l5-9h-4z"/>';

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.38"/>
        </filter>
      </defs>
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.2 15.1 26.2 15.7 26.8.7.7 1.9.7 2.6 0C18.9 43.2 34 29.2 34 17 34 7.6 26.4 0 17 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="17" cy="16" r="12" fill="rgba(0,0,0,0.2)"/>
      <g transform="translate(6, 4)">
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
  const activeInfoWindowRef = useRef<any>(null);

  // Veri güvencesi: Eğer veritabanından 0 istasyon geldiyse, yedek Türkiye ağını devreye sok
  const activeStations = useMemo(() => {
    if (stations && stations.length > 0) return stations;
    return FALLBACK_STATIONS.map((s) => ({
      id: s.id,
      name: s.name,
      operator: s.operator,
      city: s.city,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      maxPowerKw: s.maxPowerKw,
      socketCount: s.socketCount,
      isFast: s.isFast,
      price: s.price,
    }));
  }, [stations]);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Filtreler (Babuba usulü)
  const [selectedOperator, setSelectedOperator] = useState<string>("Tümü");
  const [selectedPower, setSelectedPower] = useState<"all" | "hpc" | "fast" | "ac">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(null);

  // 1. Google Maps JS SDK Loader
  useEffect(() => {
    if (typeof window === "undefined") return;

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
    script.onload = () => setMapsLoaded(true);
    script.onerror = () =>
      setLoadError("Google Haritalar yüklenemedi. Lütfen internet bağlantınızı kontrol edin.");
    document.head.appendChild(script);
  }, []);

  // 2. Initialize Google Map
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 39.2, lng: 35.2 }, // Türkiye merkezi
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
      });

      mapInstanceRef.current = map;
    }
  }, [mapsLoaded]);

  // 3. Mesafe hesaplama ve filtreleme
  const stationsWithDistance = useMemo(() => {
    return activeStations.map((s) => {
      let distanceKm: number | undefined;
      if (userLocation && s.lat && s.lng) {
        distanceKm = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
      }
      return { ...s, distanceKm };
    });
  }, [activeStations, userLocation]);

  const filteredStations = useMemo(() => {
    return stationsWithDistance.filter((s) => {
      if (!s.lat || !s.lng) return false;

      // Operatör filtresi
      if (selectedOperator !== "Tümü") {
        const opName = (s.operator || "").toLowerCase();
        const targetOp = selectedOperator.toLowerCase();
        if (!opName.includes(targetOp)) return false;
      }

      // Güç filtresi
      const kw = s.maxPowerKw || (s.isFast ? 180 : 22);
      if (selectedPower === "hpc" && kw < 150) return false;
      if (selectedPower === "fast" && (kw < 50 || kw >= 150)) return false;
      if (selectedPower === "ac" && kw >= 50) return false;

      // Arama filtresi
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(q);
        const matchOp = (s.operator || "").toLowerCase().includes(q);
        const matchCity = (s.city || "").toLowerCase().includes(q);
        const matchDistrict = (s.district || "").toLowerCase().includes(q);
        if (!matchName && !matchOp && !matchCity && !matchDistrict) return false;
      }

      return true;
    });
  }, [stationsWithDistance, selectedOperator, selectedPower, searchQuery]);

  // Sıralanmış liste (Kullanıcı konumu varsa en yakından uzağa, yoksa en güçlü HPC'den)
  const sortedStations = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      return (b.maxPowerKw || 0) - (a.maxPowerKw || 0);
    });
  }, [filteredStations]);

  // 4. Update Markers on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Haritada en fazla 350 marker göstererek performansı yüksek tut
    const visibleStations = filteredStations.slice(0, 350);

    visibleStations.forEach((s) => {
      const kw = s.maxPowerKw || (s.isFast ? 180 : 22);
      const isHpc = kw >= 150;
      const isFast = kw >= 50 && kw < 150;

      const markerColor = isHpc ? "#dc2626" : isFast ? "#d97706" : "#059669";

      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map,
        title: `${s.operator} - ${s.name}`,
        icon: {
          url: createMarkerSvg(markerColor, isHpc),
          scaledSize: new google.maps.Size(30, 40),
          anchor: new google.maps.Point(15, 40),
        },
      });

      marker.addListener("click", () => {
        setSelectedStation(s);
        map.panTo({ lat: s.lat, lng: s.lng });
      });

      markersRef.current.push(marker);
    });
  }, [filteredStations]);

  // 5. GPS "Konumumu Bul" (Babuba tarzı)
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setLocating(true);
    setLocationStatus("Canlı GPS konumu alınıyor...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setLocating(false);
        setLocationStatus(null);

        if (mapInstanceRef.current) {
          const google = (window as any).google;
          const map = mapInstanceRef.current;

          // Pan and zoom to user
          map.panTo(coords);
          map.setZoom(13);

          // Update user pin
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          userMarkerRef.current = new google.maps.Marker({
            position: coords,
            map,
            title: "Mevcut Konumunuz",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#0284c7",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationStatus("Konum izni verilmedi. Tarayıcı ayarlarından konuma izin verin.");
        } else {
          setLocationStatus("Konum alınamadı. GPS bağlantınızı kontrol edin.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 6. Şehir / İlçe Arama ve Haritada Uçma
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const google = (window as any).google;
    if (!google || !google.maps) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: `${searchQuery}, Türkiye` },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          mapInstanceRef.current.panTo(loc);
          mapInstanceRef.current.setZoom(12);
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. ÜST ARAMA, KONUM VE FİLTRELEME ÇUBUĞU (Babuba Stili) */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white border border-neutral-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Arama Kutusu */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şehir, ilçe veya istasyon ara (örn: Kadıköy, Bolu Dağı, Çankaya)..."
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-sky-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <IconClose className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Konumumu Bul Butonu */}
          <button
            type="button"
            onClick={locateUser}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs shrink-0 active:scale-95 disabled:opacity-50"
          >
            <span className={`h-2 w-2 rounded-full bg-white ${locating ? "animate-ping" : ""}`} />
            <span>{locating ? "Konum Alınıyor..." : "📍 Konumumu Bul"}</span>
          </button>
        </div>

        {locationStatus && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800 font-medium">
            {locationStatus}
          </div>
        )}

        {/* 2. OPERATÖR VE GÜÇ FİLTRE BUTONLARI (Babuba Stili) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
          {/* Operatörler */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <span className="text-[11px] text-neutral-400 font-black uppercase shrink-0 mr-1">
              Operatör:
            </span>
            {OPERATORS.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setSelectedOperator(op)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  selectedOperator === op
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Güç Dilimleri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <span className="text-[11px] text-neutral-400 font-black uppercase shrink-0 mr-1">
              Güç:
            </span>
            <button
              type="button"
              onClick={() => setSelectedPower("all")}
              className={`rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                selectedPower === "all"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setSelectedPower("hpc")}
              className={`rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                selectedPower === "hpc"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 border border-red-200/60 hover:bg-red-100"
              }`}
            >
              ⚡ Ultra Hızlı (HPC 150+ kW)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPower("fast")}
              className={`rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                selectedPower === "fast"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100"
              }`}
            >
              ⚡ Hızlı (50-120 kW)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPower("ac")}
              className={`rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                selectedPower === "ac"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
              }`}
            >
              🔌 AC (≤22 kW)
            </button>
          </div>
        </div>
      </div>

      {/* 3. GOOGLE HARİTA VE DETAY ÇEKMECESİ KAPSAYICISI */}
      <div className="relative w-full h-[520px] sm:h-[600px] rounded-3xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* İstasyon Detay Kartı (Harita üzerinde Babuba tarzı açılan kart) */}
        {selectedStation && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 p-4 sm:p-5 shadow-2xl transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-700">
                {selectedStation.operator}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
                aria-label="Kapat"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-black text-neutral-900 leading-snug mb-1">
              {selectedStation.name}
            </h3>

            <p className="text-xs text-neutral-500 mb-3">
              {selectedStation.district ? `${selectedStation.district}, ` : ""}
              {selectedStation.city}
              {selectedStation.distanceKm != null && (
                <span className="font-bold text-sky-600 ml-1">
                  · Size {selectedStation.distanceKm} km
                </span>
              )}
            </p>

            {/* Metrikler Kutusu */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-2.5 border border-neutral-200/70 mb-3.5 text-center text-xs">
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Maks Güç</span>
                <strong className="block text-xs font-black text-neutral-900">
                  {selectedStation.maxPowerKw || (selectedStation.isFast ? 180 : 22)} kW
                </strong>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Soket</span>
                <strong className="block text-xs font-black text-emerald-600">
                  {selectedStation.socketCount || 2} Nokta
                </strong>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Tarife</span>
                <strong className="block text-xs font-black text-neutral-900">
                  {selectedStation.price ? `${selectedStation.price.toFixed(2)} ₺` : "8.49 ₺"}
                </strong>
              </div>
            </div>

            {/* Aksiyon Butonları (Google Haritalar Yol Tarifi) */}
            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-center py-2.5 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Yol Tarifi Al</span>
                <span className="text-xs">↗</span>
              </a>
              <Link
                href="/sarj-agi/rota"
                className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2.5 text-xs font-bold text-neutral-700 transition"
              >
                Rota Ekle
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. YAKINDAKİ ŞARJ İSTASYONLARI LİSTESİ (Babuba Stili) */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-neutral-900">
              {userLocation ? "Size En Yakın İstasyonlar" : "Öne Çıkan Şarj İstasyonları"}
            </h2>
            <p className="text-xs text-neutral-500">
              {filteredStations.length} adet istasyon bulundu
            </p>
          </div>
          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
            {selectedOperator} · {selectedPower === "all" ? "Tüm Güçler" : selectedPower.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedStations.slice(0, 12).map((s) => {
            const kw = s.maxPowerKw || (s.isFast ? 180 : 22);
            const isHpc = kw >= 150;

            return (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStation(s);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo({ lat: s.lat, lng: s.lng });
                    mapInstanceRef.current.setZoom(14);
                  }
                  window.scrollTo({ top: mapContainerRef.current?.offsetTop ? mapContainerRef.current.offsetTop - 80 : 0, behavior: "smooth" });
                }}
                className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 hover:border-sky-400 hover:shadow-md transition flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {s.operator}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isHpc
                          ? "bg-red-50 text-red-700 font-extrabold"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {kw} kW DC
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                    {s.name}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                    {s.district ? `${s.district}, ` : ""}{s.city}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100 text-xs">
                  {s.distanceKm != null ? (
                    <span className="font-bold text-sky-600">
                      📍 {s.distanceKm} km mesafede
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-medium">
                      {s.socketCount || 2} Soket
                    </span>
                  )}

                  <span className="text-sky-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    Haritada Gör →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
