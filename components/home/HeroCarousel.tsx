"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconPlay,
} from "@/components/ui/Icons";
import { timeAgo } from "@/lib/utils";

export type Slide = {
  id: string;
  title: string;
  slug: string;
  spot: string;
  image: string;
  isVideo?: boolean;
  isBreaking?: boolean;
  sourceName?: string | null;
  publishedAt: string | Date;
  category: { name: string; slug: string; color: string };
};

export default function HeroCarousel({
  slides,
  interval = 6000,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;

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
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
    touchStart.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-200/60 shadow-lg group select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((s, i) => {
          const href =
            s.slug && s.slug.trim().length > 0
              ? `/haber/${s.slug}`
              : `/haber/${s.id}`;

          const isActive = i === index;

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* Arka Plan Görseli */}
              <Link href={href} className="block relative w-full h-full overflow-hidden">
                <Image
                  src={s.image || "/haber-placeholder.svg"}
                  alt={s.title}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 1400px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                />

                {/* Modern ve Sade Gradyan (Kutu yerine doğal sinematik geçiş) */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 via-45% to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 via-transparent to-transparent pointer-events-none" />
              </Link>

              {/* Sade & Modern Editoryal Metin Alanı */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8 lg:p-10 pointer-events-auto">
                <Link
                  href={href}
                  className="group/link flex flex-col gap-2.5 sm:gap-3.5 max-w-4xl"
                >
                  {/* Üst Bilgi Rozetleri (Minimalist & Net) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {s.isBreaking && (
                      <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase shadow-xs">
                        SON DAKİKA
                      </span>
                    )}

                    <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                      {(s.category?.name || "HABER").toUpperCase()}
                    </span>

                    {s.sourceName && (
                      <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 tracking-wide flex items-center gap-1">
                        <span>⚡</span>
                        <span>{s.sourceName}</span>
                      </span>
                    )}

                    {s.isVideo && (
                      <span className="flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                        <IconPlay className="h-3 w-3 text-red-400" />
                        VİDEO
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-300/80 ml-1">
                      <IconClock className="h-3 w-3 text-neutral-400" />
                      {timeAgo(s.publishedAt)}
                    </span>
                  </div>

                  {/* Başlık */}
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2] drop-shadow-md group-hover/link:text-red-400 transition-colors line-clamp-2">
                    {s.title}
                  </h2>

                  {/* Özet Spot (Ferah ve Sade) */}
                  {s.spot && (
                    <p className="hidden sm:line-clamp-2 text-xs sm:text-sm lg:text-base text-neutral-300 font-normal leading-relaxed max-w-3xl drop-shadow-xs">
                      {s.spot}
                    </p>
                  )}

                  {/* Minimal Okuma İpucu */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover/link:text-red-300 tracking-wider uppercase pt-1">
                    <span>Haberin Devamı</span>
                    <span className="transition-transform duration-200 group-hover/link:translate-x-1">
                      →
                    </span>
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
              aria-label="Önceki haber"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/40 hover:bg-neutral-900/80 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki haber"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/40 hover:bg-neutral-900/80 text-white backdrop-blur-md border border-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Modern & Sade Çizgisel Sayfa Göstergeleri */}
        {count > 1 && (
          <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 z-30 flex items-center gap-3 bg-neutral-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <span className="text-[11px] font-bold text-white/70 tracking-widest tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  aria-label={`${i + 1}. haber`}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    i === index
                      ? "w-6 bg-red-600 shadow-sm shadow-red-500/50"
                      : "w-2 bg-white/35 hover:bg-white/70"
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
