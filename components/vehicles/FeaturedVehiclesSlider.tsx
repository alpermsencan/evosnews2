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
      className="relative w-full overflow-hidden bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-800 shadow-xl group select-none touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[340px] sm:h-[400px] lg:h-[440px] w-full">
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
              {/* Arka Plan & Araç Görseli (Mobilde Araç Üst Kısımda Tamamen Net Görünür) */}
              <Link
                href={href}
                className="block relative w-full h-full overflow-hidden bg-radial from-neutral-900 via-neutral-950 to-black"
              >
                {/* Üst Rozet (Mobilde sol üstte zarif durur) */}
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-400 border border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    {v.tag || "ÖNE ÇIKAN MODEL"}
                  </span>
                  {v.body && (
                    <span className="hidden sm:inline-flex rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-neutral-300 uppercase">
                      {v.body}
                    </span>
                  )}
                </div>

                <div className="relative w-full h-full pb-20 sm:pb-24 pt-10 sm:pt-6 px-4 sm:px-12 flex items-center justify-center">
                  <SafeImage
                    src={v.image}
                    alt={`${v.brand} ${v.model}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 1400px"
                    className="object-contain p-2 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                    fallbackSrc="/arac-placeholder.svg"
                  />
                </div>

                {/* Alt Gradient Gölge */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
              </Link>

              {/* Alt Bilgi Şeridi: Sade, Kompakt, Görseli Kapatmayan Kurumsal Tasarım */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 pointer-events-auto">
                <Link
                  href={href}
                  className="group/link block rounded-xl sm:rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-white/10 p-3 sm:p-4 transition hover:border-sky-500/50 hover:bg-neutral-900/95"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-black text-sky-400 uppercase tracking-wider">
                        {v.brand}
                      </span>
                      <h2 className="text-sm sm:text-lg lg:text-xl font-black text-white tracking-tight truncate group-hover/link:text-sky-300 transition-colors">
                        {v.model}
                      </h2>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-300 font-semibold">
                        <span className="text-emerald-400 font-bold">{v.range} km</span>
                        <span className="text-white/20">·</span>
                        <span className="text-amber-400 font-bold">{v.power}</span>
                        <span className="text-white/20">·</span>
                        <span className="text-sky-300 font-bold">{v.dcSpeed}</span>
                      </div>
                      <div className="text-xs sm:text-base font-black text-white shrink-0 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                        {formatTL(v.price)}
                      </div>
                    </div>
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
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki araç"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Gösterge Noktaları */}
        {count > 1 && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full bg-neutral-900/80 px-2.5 py-1 backdrop-blur-md border border-white/10">
            {vehicles.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Araç ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 bg-sky-400"
                    : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
