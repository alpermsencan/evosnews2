"use client";

import { useMemo, useState } from "react";
import { TR_MAP, TR_OUTLINE_PATH, projectPoint, withinTurkey } from "@/lib/tr-map";
import { formatKm, haversineKm } from "@/lib/geo";
import RouteButton from "./RouteButton";
import { IconBolt, IconMap } from "@/components/ui/Icons";

/**
 * ŞARJ İSTASYONU HARİTASI
 *
 * Dış döşeme sunucusu YOKTUR: ülke sınırı lib/tr-map.ts içindeki inline SVG
 * yolundan çizilir, istasyonlar aynı izdüşümle üzerine oturtulur. Böylece
 * harita API anahtarı, kullanım kotası ve sağlayıcı bağımlılığı olmadan
 * çalışır (bkz. lib/tr-map.ts başlığı).
 *
 * İşaretler GÜCE GÖRE renklenir ve yoğun bölgelerde üst üste binmemeleri için
 * ızgaraya göre kümelenir: aynı hücreye düşen istasyonlar tek bir daire olarak
 * sayısıyla gösterilir. Yakınlaştırma arttıkça hücre küçülür ve kümeler açılır.
 */

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

type Cluster = {
  key: string;
  x: number;
  y: number;
  items: MapStation[];
  maxKw: number;
};

/** Güç kademesine göre renk — efsanedeki (legend) renklerle aynı. */
function powerTone(kw: number | null) {
  if (kw == null) return { fill: "#a3a3a3", label: "Bilinmiyor" };
  if (kw >= 150) return { fill: "#e30613", label: "≥ 150 kW (ultra)" };
  if (kw >= 50) return { fill: "#f59e0b", label: "50–149 kW (DC)" };
  return { fill: "#00b34a", label: "< 50 kW (AC)" };
}

const ZOOMS = [1, 2, 3.5] as const;

export default function StationMap({ stations }: { stations: MapStation[] }) {
  const [zoom, setZoom] = useState<number>(1);
  const [selected, setSelected] = useState<Cluster | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const points = useMemo(
    () =>
      stations
        .filter((s) => withinTurkey(s.lng, s.lat))
        .map((s) => ({ station: s, ...projectPoint(s.lng, s.lat) })),
    [stations],
  );

  // Kümeleme ızgarası: yakınlaştırma arttıkça hücre küçülür, kümeler çözülür.
  const clusters = useMemo(() => {
    const cell = 26 / zoom;
    const map = new Map<string, Cluster>();

    for (const p of points) {
      const key = `${Math.floor(p.x / cell)}:${Math.floor(p.y / cell)}`;
      const existing = map.get(key);
      const kw = p.station.maxPowerKw ?? 0;

      if (existing) {
        existing.items.push(p.station);
        // Küme rengi içindeki EN GÜÇLÜ istasyona göre belirlenir; kullanıcı
        // haritaya hızlı şarj aramak için bakar.
        existing.maxKw = Math.max(existing.maxKw, kw);
        // Merkez, kümeye giren noktaların ortalaması olsun.
        existing.x = (existing.x * (existing.items.length - 1) + p.x) / existing.items.length;
        existing.y = (existing.y * (existing.items.length - 1) + p.y) / existing.items.length;
      } else {
        map.set(key, { key, x: p.x, y: p.y, items: [p.station], maxKw: kw });
      }
    }

    return [...map.values()].sort((a, b) => a.items.length - b.items.length);
  }, [points, zoom]);

  const userPoint = userPos && withinTurkey(userPos.lng, userPos.lat)
    ? projectPoint(userPos.lng, userPos.lat)
    : null;

  function locate() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-volt text-white">
            <IconMap className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            İSTASYON HARİTASI
          </h2>
          <span className="text-[11px] font-bold text-neutral-400">
            {points.length} istasyon
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ZOOMS.map((z, i) => (
            <button
              key={z}
              type="button"
              onClick={() => {
                setZoom(z);
                setSelected(null);
              }}
              aria-pressed={zoom === z}
              className={`rounded px-2.5 py-1.5 text-[11px] font-black transition ${
                zoom === z ? "bg-volt text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {["ÜLKE", "BÖLGE", "YAKIN"][i]}
            </button>
          ))}
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="rounded bg-neutral-900 px-2.5 py-1.5 text-[11px] font-black text-white transition hover:bg-neutral-700 disabled:opacity-60"
          >
            {locating ? "KONUM…" : "KONUMUM"}
          </button>
        </div>
      </div>

      <div className="relative bg-[#f4f7f9]">
        <svg
          viewBox={`0 0 ${TR_MAP.width} ${TR_MAP.height}`}
          className="block h-auto w-full touch-pan-y"
          role="img"
          aria-label={`Türkiye haritası üzerinde ${points.length} şarj istasyonu`}
        >
          {/* Ülke sınırı — Natural Earth (kamu malı), tek SVG yolu. */}
          <path
            d={TR_OUTLINE_PATH}
            fill="#e8eef2"
            stroke="#c4d0d8"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />

          {clusters.map((c) => {
            const many = c.items.length > 1;
            const r = many
              ? Math.min(14, 4 + Math.log2(c.items.length) * 2.4)
              : 3.4;
            const tone = powerTone(c.maxKw || null);
            const active = selected?.key === c.key;

            return (
              <g key={c.key}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  fill={tone.fill}
                  fillOpacity={many ? 0.82 : 0.95}
                  stroke={active ? "#0f172a" : "#ffffff"}
                  strokeWidth={active ? 2 : 0.9}
                  className="cursor-pointer"
                  onClick={() => setSelected(active ? null : c)}
                />
                {many && r >= 8 && (
                  <text
                    x={c.x}
                    y={c.y + 3}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    fill="#ffffff"
                    fontSize={r >= 11 ? 9 : 7.5}
                    fontWeight="800"
                  >
                    {c.items.length}
                  </text>
                )}
              </g>
            );
          })}

          {userPoint && (
            <g>
              <circle cx={userPoint.x} cy={userPoint.y} r={9} fill="#2563eb" fillOpacity={0.22} />
              <circle
                cx={userPoint.x}
                cy={userPoint.y}
                r={4}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </g>
          )}
        </svg>

        {/* EFSANE */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-1 rounded bg-white/90 px-2.5 py-2 text-[10px] font-bold text-neutral-600 backdrop-blur">
          {[150, 50, 10, null].map((kw) => {
            const t = powerTone(kw);
            return (
              <span key={t.label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.fill }} />
                {t.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* SEÇİLEN KÜME */}
      {selected && (
        <div className="border-t border-neutral-100">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[12px] font-black text-neutral-800">
              {selected.items.length === 1
                ? "SEÇİLEN İSTASYON"
                : `BU NOKTADA ${selected.items.length} İSTASYON`}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-[11px] font-bold text-neutral-400 hover:text-evos"
            >
              KAPAT
            </button>
          </div>

          <ul className="max-h-[320px] overflow-y-auto divide-y divide-neutral-100">
            {selected.items.slice(0, 20).map((s) => (
              <li key={s.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-black text-neutral-900">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {s.city} / {s.district} · {s.operator} · {s.socketCount} soket
                      {userPos && ` · ${formatKm(haversineKm(userPos.lat, userPos.lng, s.lat, s.lng))}`}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-black text-volt-dark">
                    <IconBolt className="h-3 w-3" />
                    {s.maxPowerKw != null ? `${s.maxPowerKw} kW` : "—"}
                    {s.price != null && ` · ${s.price.toFixed(2)} ₺`}
                  </span>
                </div>
                <RouteButton
                  name={s.name}
                  lat={s.lat}
                  lng={s.lng}
                  city={s.city}
                  district={s.district}
                />
              </li>
            ))}
          </ul>

          {selected.items.length > 20 && (
            <p className="px-4 py-2 text-[11px] text-neutral-400">
              İlk 20 istasyon gösteriliyor — yakınlaştırarak kümeyi açabilirsiniz.
            </p>
          )}
        </div>
      )}

      <p className="border-t border-neutral-100 px-4 py-2.5 text-[11px] text-neutral-400">
        Harita dış bir döşeme sunucusuna bağlanmaz; ülke sınırı Natural Earth
        (kamu malı) verisinden tek seferde üretilip site içinde saklanır.
        İstasyon envanteri Open Charge Map katkıcılarındandır (ODbL).
      </p>
    </section>
  );
}
