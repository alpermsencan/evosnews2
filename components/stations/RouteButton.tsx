"use client";

import { useState } from "react";
import { IconMap } from "@/components/ui/Icons";

/**
 * İstasyona gerçek yol rotası.
 *
 * Kullanıcının konumu tarayıcıdan izinle alınır ve sunucudaki
 * /api/route-to üzerinden OpenRouteService'e sorulur. Sonuç gerçek sürüş
 * mesafesi ve süresidir; rota geometrisi harita döşemesi indirmeden inline
 * SVG olarak çizilir. Servis erişilemezse kuş uçuşu mesafeye düşülür ve bu
 * durum kullanıcıya açıkça yazılır.
 */

type RouteData = {
  mode: "route" | "straight";
  distanceKm: number;
  durationMin: number | null;
  geometry: [number, number][];
  note?: string;
  attribution?: string;
};

type State =
  | { status: "idle" }
  | { status: "locating" | "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: RouteData };

function currentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Tarayıcınız konum servisini desteklemiyor"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 300_000,
    });
  });
}

/** Rota noktalarını 200×120'lik bir kutuya oranı koruyarak sığdırır. */
function toPolyline(points: [number, number][], w = 200, h = 120, pad = 8) {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const spanLng = maxLng - minLng || 1e-6;
  const spanLat = maxLat - minLat || 1e-6;
  // Enlem arttıkça boylam daralır; ölçeği düzeltmeden rota yamuk görünür.
  const lngScale = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const scale = Math.min((w - pad * 2) / (spanLng * lngScale), (h - pad * 2) / spanLat);

  const offsetX = (w - spanLng * lngScale * scale) / 2;
  const offsetY = (h - spanLat * scale) / 2;

  return points
    .map(([lng, lat]) => {
      const x = offsetX + (lng - minLng) * lngScale * scale;
      // SVG'de y aşağı doğru büyür; kuzey yukarıda kalsın diye ters çevrilir.
      const y = offsetY + (maxLat - lat) * scale;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function RouteButton({
  name,
  lat,
  lng,
  city,
  district,
}: {
  name: string;
  lat: number;
  lng: number;
  city: string;
  district: string;
}) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function plan() {
    try {
      setState({ status: "locating" });
      const pos = await currentPosition();

      setState({ status: "loading" });
      const params = new URLSearchParams({
        fromLat: String(pos.coords.latitude),
        fromLng: String(pos.coords.longitude),
        toLat: String(lat),
        toLng: String(lng),
      });

      const res = await fetch(`/api/route-to?${params}`);
      const json = await res.json();
      // Uç nokta rotayı ÜST SEVİYEDE döndürür ({mode, distanceKm, ...}),
      // `data` sarmalayıcısı içinde değil. Hata durumunda gövde {error} olur.
      if (!res.ok) throw new Error(json?.error ?? "Rota alınamadı");
      if (!json?.geometry?.length) throw new Error("Rota verisi eksik döndü");

      setState({ status: "done", data: json as RouteData });
    } catch (e) {
      const message =
        e instanceof GeolocationPositionError || (e as { code?: number })?.code === 1
          ? "Konum izni verilmedi"
          : e instanceof Error
            ? e.message
            : "Rota hesaplanamadı";
      setState({ status: "error", message });
    }
  }

  const busy = state.status === "locating" || state.status === "loading";

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-100 pt-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={plan}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-[11px] font-black text-neutral-700 transition hover:bg-volt hover:text-white disabled:opacity-60"
        >
          <IconMap className="h-3.5 w-3.5" />
          {state.status === "locating"
            ? "KONUM ALINIYOR…"
            : state.status === "loading"
              ? "ROTA HESAPLANIYOR…"
              : "ROTA OLUŞTUR"}
        </button>

        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-neutral-400 transition hover:text-volt-dark"
          aria-label={`${name} konumunu haritada aç`}
        >
          HARİTADA AÇ
        </a>
      </div>

      {state.status === "error" && (
        <p className="text-[11px] font-semibold text-evos">{state.message}</p>
      )}

      {state.status === "done" && (
        <div className="flex items-center gap-3 rounded-md bg-neutral-50 p-2">
          <svg
            viewBox="0 0 200 120"
            className="h-[72px] w-[120px] shrink-0 rounded bg-white"
            role="img"
            aria-label={`${city} / ${district} yönünde rota önizlemesi`}
          >
            <polyline
              points={toPolyline(state.data.geometry)}
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={state.data.mode === "straight" ? "5 4" : undefined}
            />
          </svg>

          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-black text-neutral-900">
              {state.data.distanceKm} km
              {state.data.durationMin != null && ` · ${state.data.durationMin} dk`}
            </span>
            <span className="text-[10px] font-semibold text-neutral-500">
              {state.data.mode === "route"
                ? "Gerçek sürüş rotası"
                : "Kuş uçuşu mesafe"}
            </span>
            {state.data.note && (
              <span className="text-[10px] text-neutral-400">{state.data.note}</span>
            )}
            {state.data.attribution && (
              <span className="text-[9px] text-neutral-400">{state.data.attribution}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
