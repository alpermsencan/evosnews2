"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { formatTL } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";

export interface ShowcaseVehicle {
  brand: string;
  model: string;
  slug: string;
  tag: string;
  tagColor: string;
  price: number;
  range: number;
  power: string;
  dcSpeed: string;
  body: string;
  acceleration?: string;
  image: string;
}

export default function FeaturedVehiclesSlider({
  vehicles,
  interval = 6000,
}: {
  vehicles: ShowcaseVehicle[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const count = vehicles.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [index, paused, next, interval, count]);

  if (!count) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      (deltaX < 0 ? next : prev)();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-200/60 shadow-lg group select-none touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {vehicles.map((v, i) => {
          const href = `/araclar/${v.slug}`;
          const isActive = i === index;

          return (
            <div
              key={v.slug}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* Arka Plan & Araç Görseli */}
              <Link href={href} className="block relative w-full h-full overflow-hidden bg-gradient-to-br from-neutral-950 via-slate-950 to-neutral-900">
                <SafeImage
                  src={v.image}
                  alt={`${v.brand} ${v.model}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 1400px"
                  className="object-contain p-6 sm:p-10 lg:p-14 transition-transform duration-1000 ease-out group-hover:scale-105"
                  fallbackSrc="/arac-placeholder.svg"
                />

                {/* Sadece Alttan Okunabilirlik Gölgesi */}
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />
              </Link>

              {/* Alt Sol Kayan Cam Kart: Başlık, Fiyat ve Renkli Özellikler */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 lg:p-8 pointer-events-auto">
                <Link
                  href={href}
                  className="group/link block max-w-3xl rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/20 p-4 sm:p-5 lg:p-6 shadow-2xl transition hover:border-sky-500 hover:bg-neutral-950/95"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-400">
                      ÖNE ÇIKAN MODEL {v.tag ? `· ${v.tag}` : "· VİTRİN"}
                    </span>
                    {v.body && (
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/80 uppercase">
                        {v.body}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug group-hover/link:text-sky-300 transition-colors drop-shadow-sm">
                      {v.brand} {v.model}
                    </h2>
                    <div className="text-base sm:text-xl font-black text-sky-400 shrink-0">
                      {formatTL(v.price)}
                    </div>
                  </div>

                  {/* Renkli Metrik Çipleri */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 pt-2.5 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span>🔋</span>
                      <span>{v.range} km WLTP</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <span>⚡</span>
                      <span>{v.power}</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-sky-300 font-bold">
                      <span>⏱️</span>
                      <span>{v.dcSpeed}</span>
                    </div>
                    {v.acceleration && (
                      <>
                        <span className="text-white/20">•</span>
                        <div className="text-white/70 font-semibold">
                          0-100: {v.acceleration}
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          );
        })}

        {/* Minimalist Cam Ok Butonları */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki araç"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/40 hover:bg-neutral-900/80 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki araç"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/40 hover:bg-neutral-900/80 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Modern Sayfa Göstergesi (Mobilde üstte, masaüstünde altta) */}
        {count > 1 && (
          <div className="absolute top-4 right-4 sm:top-auto sm:bottom-8 sm:right-8 z-30 flex items-center gap-2.5 sm:gap-3 bg-neutral-950/75 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/15 shadow-xl">
            <span className="text-[10px] sm:text-[11px] font-black text-white/80 tracking-widest tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              {vehicles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Araç ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-sky-500" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
