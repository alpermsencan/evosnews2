"use client";

import { useState } from "react";
import { IconBolt, IconClock, IconMap } from "@/components/ui/Icons";

interface VehicleData {
  id: string;
  brand: string;
  model: string;
  rangeKm: number;
  batteryKwh: number;
  consumption: number;
}

interface StopData {
  id: string;
  name: string;
  operator: string;
  city: string;
  lat: number;
  lng: number;
  maxPowerKw: number;
  pricePerKwh: number;
  distanceToRouteKm: number;
}

interface ResultData {
  route: {
    distanceKm: number;
    durationMin: number;
    geometry: [number, number][];
  };
  vehicle: {
    brand: string;
    model: string;
    batteryKwh: number;
    consumption: number;
    rangeKm: number;
  } | null;
  summary: {
    totalEnergyRequiredKwh: number;
    numStopsNeeded: number;
    estimatedCostTl: number;
  };
  recommendedStations: StopData[];
}

export default function RouteCalculatorClient({ vehicles }: { vehicles: VehicleData[] }) {
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultData | null>(null);

  // Geocode araması yapar
  async function searchLocation(text: string, type: "start" | "dest") {
    if (text.length < 3) return;
    try {
      const res = await fetch(`/api/geocode?text=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (type === "start") {
        setStartSuggestions(data.results || []);
      } else {
        setDestSuggestions(data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Rota hesaplamasını başlatır
  async function calculateRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!startCoords || !destCoords) {
      setError("Lütfen kalkış ve varış noktalarını listeden seçin.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const url = `/api/route-calculator?fromLat=${startCoords.lat}&fromLng=${startCoords.lng}&toLat=${destCoords.lat}&toLng=${destCoords.lng}&vehicleId=${selectedVehicleId}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Rota hesaplanamadı.");
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Form Alanı */}
      <div className="lg:col-span-1">
        <form onSubmit={calculateRoute} className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3">Rota Parametreleri</h2>

          {/* Başlangıç Noktası */}
          <div className="relative flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">KALKIŞ NOKTASI *</span>
            <input
              type="text"
              required
              placeholder="Örn: Kadıköy, İstanbul"
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                searchLocation(e.target.value, "start");
              }}
              className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-evos"
            />
            {startSuggestions.length > 0 && (
              <div className="absolute top-[60px] z-10 w-full rounded-md border border-neutral-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {startSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStartCoords({ lat: item.lat, lng: item.lng });
                      setStartQuery(item.name);
                      setStartSuggestions([]);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 border-b border-neutral-50 last:border-0"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Varış Noktası */}
          <div className="relative flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">VARIŞ NOKTASI *</span>
            <input
              type="text"
              required
              placeholder="Örn: Çankaya, Ankara"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                searchLocation(e.target.value, "dest");
              }}
              className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-evos"
            />
            {destSuggestions.length > 0 && (
              <div className="absolute top-[60px] z-10 w-full rounded-md border border-neutral-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDestCoords({ lat: item.lat, lng: item.lng });
                      setDestQuery(item.name);
                      setDestSuggestions([]);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 border-b border-neutral-50 last:border-0"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Araç Seçimi */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">ARAÇ MODELİ</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none transition bg-white focus:border-evos"
            >
              <option value="">Varsayılan EV (18 kWh/100km)</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.rangeKm} km)
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs font-bold text-evos bg-evos/5 p-2.5 rounded-md">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-evos py-3 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
          >
            {loading ? "HESAPLANIYOR..." : "ROTA & ŞARJ HESAPLA"}
          </button>
        </form>
      </div>

      {/* Sonuç Alanı */}
      <div className="lg:col-span-2">
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-evos border-t-transparent"></div>
            <span className="mt-4 text-sm font-black text-neutral-500">Optimum şarj noktaları aranıyor...</span>
          </div>
        )}

        {!loading && !results && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-6 text-center text-neutral-400">
            <IconMap className="h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-base font-black text-neutral-700">Yolculuk Maliyetini Hesapla</h3>
            <p className="mt-1 text-xs max-w-sm">
              Kalkış, varış noktalarını girip hesapla butonuna bastığınızda rota bilgisi ve durak detayları burada görüntülenecektir.
            </p>
          </div>
        )}

        {results && (
          <div className="flex flex-col gap-6">
            {/* Özet Kartları */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black tracking-wider text-neutral-400 block uppercase">YOL MESAFESİ</span>
                <span className="text-2xl font-black text-neutral-900 mt-1 block">{results.route.distanceKm} km</span>
                <span className="text-[11px] text-neutral-500 mt-1 block flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5 inline text-neutral-400" />
                  Yaklaşık {Math.floor(results.route.durationMin / 60)} sa {results.route.durationMin % 60} dk
                </span>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black tracking-wider text-neutral-400 block uppercase">ŞARJ İHTİYACI</span>
                <span className="text-2xl font-black text-neutral-900 mt-1 block">{results.summary.numStopsNeeded} Durak</span>
                <span className="text-[11px] text-neutral-500 mt-1 block flex items-center gap-1">
                  <IconBolt className="h-3.5 w-3.5 inline text-neutral-400" />
                  Toplam Tüketim: {results.summary.totalEnergyRequiredKwh} kWh
                </span>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black tracking-wider text-neutral-400 block uppercase">TAHMİNİ ELEKTRİK MALİYETİ</span>
                <span className="text-2xl font-black text-evos mt-1 block">₺{results.summary.estimatedCostTl}</span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  DC şarj ortalama tarifelerine göre
                </span>
              </div>
            </div>

            {/* Rota Üzerindeki OCPI İstasyonları */}
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 mb-4">
                Rota Üzerindeki Önerilen Şarj Noktaları (OCPI Entegre)
              </h3>
              
              {results.recommendedStations.length === 0 ? (
                <p className="text-sm text-neutral-500 py-4 text-center">
                  Rota çizgisine yakın hızlı şarj istasyonu bulunamadı.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.recommendedStations.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">{item.operator}</span>
                        <h4 className="text-sm font-black text-neutral-800">{item.name}</h4>
                        <span className="text-xs text-neutral-500">
                          {item.city} · Anayola {item.distanceToRouteKm} km mesafede
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-neutral-400 block">Soket Kapasitesi</span>
                          <span className="text-sm font-black text-neutral-800 block">{item.maxPowerKw} kW DC</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-neutral-400 block">Canlı Tarife</span>
                          <span className="text-sm font-black text-evos block">₺{item.pricePerKwh.toFixed(2)}/kWh</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
