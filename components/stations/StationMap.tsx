"use client";

import { useEffect, useRef, useState } from "react";
import { IconMap } from "@/components/ui/Icons";

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

export default function StationMap({ stations }: { stations: MapStation[] }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    // 1. Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // 2. Load Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).L) {
        setLeafletLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clean up previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Initialize map centered on Turkey
    const map = L.map(containerRef.current).setView([39.0, 35.0], 6);
    mapRef.current = map;

    // Load OpenStreetMap tiles (No API key needed, completely free)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create markers for each station
    stations.forEach((s) => {
      if (!s.lat || !s.lng) return;

      const isFast = s.isFast;
      const powerText = s.maxPowerKw ? `${s.maxPowerKw} kW` : "Bilinmiyor";
      const priceText = s.price ? `${s.price.toFixed(2)} ₺/kWh` : "Tarife belirtilmemiş";
      
      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #111827;">${s.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; font-weight: 600;">${s.operator}</p>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 900; color: white; background-color: ${(s.maxPowerKw || 0) >= 150 ? '#e30613' : (s.maxPowerKw || 0) >= 50 ? '#f59e0b' : '#10b981'};">${powerText}</span>
            <span style="font-size: 11px; font-weight: 700; color: #374151;">${s.socketCount} Soket</span>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0f766e;">${priceText}</p>
          <div style="border-top: 1px solid #f3f4f6; padding-top: 6px;">
            <a href="/sarj-agi/rota?toLat=${s.lat}&toLng=${s.lng}" style="display: block; text-align: center; background-color: #0f766e; color: white; border-radius: 6px; font-size: 11px; font-weight: 800; padding: 6px 0; text-decoration: none; transition: background 0.2s;">
              Yol Tarifi & Rota Çiz
            </a>
          </div>
        </div>
      `;

      // Select marker color based on power
      const markerColor = (s.maxPowerKw || 0) >= 150 ? "#e30613" : (s.maxPowerKw || 0) >= 50 ? "#f59e0b" : "#10b981";

      L.circleMarker([s.lat, s.lng], {
        radius: 8,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      })
      .bindPopup(popupContent)
      .addTo(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, stations]);

  const locate = () => {
    if (!mapRef.current || !leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    setLocating(true);
    mapRef.current.locate({ setView: true, maxZoom: 13 });
    
    mapRef.current.once("locationfound", (e: any) => {
      setLocating(false);
      L.marker(e.latlng, {
        icon: L.divIcon({
          className: "user-location-marker",
          html: `<div class="relative flex items-center justify-center"><div class="absolute h-6 w-6 rounded-full bg-blue-500/30 animate-ping"></div><div class="relative h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow"></div></div>`,
          iconSize: [24, 24],
        })
      }).addTo(mapRef.current).bindPopup("Şu an buradasınız").openPopup();
    });

    mapRef.current.once("locationerror", () => {
      setLocating(false);
      alert("Konum izni alınamadı. Tarayıcı ayarlarından izin verdiğinize emin olun.");
    });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-volt text-white">
            <IconMap className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            ETKİLEŞİMLİ ŞARJ HARİTASI
          </h2>
          <span className="text-[11px] font-bold text-neutral-400">
            {stations.length} istasyon listeleniyor
          </span>
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="rounded bg-neutral-900 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-neutral-700 disabled:opacity-60 cursor-pointer"
        >
          {locating ? "KONUMUNUZ ALINIYOR..." : "BENİ BUL (GPS)"}
        </button>
      </div>

      <div className="relative bg-[#e5e7eb] h-[450px] w-full z-10" ref={containerRef}>
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm font-bold text-neutral-500 z-20">
            Harita yükleniyor...
          </div>
        )}
      </div>

      {/* Harita Renk Efsanesi */}
      <div className="border-t border-neutral-150 bg-neutral-50 px-4 py-2.5 flex flex-wrap gap-4 text-xs font-bold text-neutral-600 justify-center">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#e30613]" />
          Ultra Hızlı (≥ 150 kW DC)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          Hızlı Şarj (50–149 kW DC)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#10b981]" />
          Standart Şarj (&lt; 50 kW AC)
        </span>
      </div>
    </section>
  );
}
