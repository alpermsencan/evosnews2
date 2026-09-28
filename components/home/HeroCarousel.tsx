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
      className="relative w-full overflow-hidden bg-neutral-900 rounded-2xl border border-neutral-200/80 shadow-sm group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((s, i) => {
          // Asla boş /haber/ linkine gitmesin: slug boşsa id'ye yönlendir
          const href = s.slug && s.slug.trim().length > 0 ? `/haber/${s.slug}` : `/haber/${s.id}`;

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== index}
            >
              {/* KAPAK RESMİ: Karartma kaldırıldı! Görsel 100% net ve aydınlık */}
              <Link href={href} className="block relative w-full h-full">
                <Image
                  src={s.image || "/haber-placeholder.svg"}
                  alt={s.title}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 1280px"
                  className="object-cover"
                />
              </Link>

              {/* ÖZEL KURUMSAL MANŞET KARTI: Resmin üzerine zarif, dikkat çekici editoryal plaka */}
              <div className="absolute bottom-4 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-2xl lg:max-w-3xl z-20 pointer-events-auto">
                <Link
                  href={href}
                  className="group/card flex flex-col gap-2.5 p-4 sm:p-5 lg:p-6 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/15 border-l-4 border-l-red-600 shadow-[0_15px_40px_rgba(0,0,0,0.55)] transition-all hover:bg-neutral-950/95"
                >
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {s.isBreaking && (
                      <span className="rounded bg-neutral-900 border border-red-500 text-red-500 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                        SON DAKİKA
                      </span>
                    )}
                    <span className="rounded bg-red-600 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                      {(s.category?.name || "HABER").toUpperCase()}
                    </span>
                    {s.sourceName && (
                      <span className="rounded bg-white/20 border border-white/25 px-2 py-0.5 text-[10px] font-bold text-amber-300 tracking-wide">
                        ⚡ {s.sourceName}
                      </span>
                    )}
                    {s.isVideo && (
                      <span className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <IconPlay className="h-3 w-3 text-red-400" /> VİDEO
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                      <IconClock className="h-3 w-3" />
                      {timeAgo(s.publishedAt)}
                    </span>
                  </div>

                  {/* Manşet Başlığı */}
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight text-white tracking-tight group-hover/card:text-red-400 transition-colors drop-shadow-xs">
                    {s.title}
                  </h2>

                  {/* Spot / Özet */}
                  {s.spot && (
                    <p className="hidden sm:line-clamp-2 text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
                      {s.spot}
                    </p>
                  )}

                  {/* Aksiyon İpucu */}
                  <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-red-500 uppercase pt-0.5 group-hover/card:translate-x-1 transition-transform">
                    <span>HABERİ OKU</span>
                    <span>→</span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}

        {/* Oklar - masaüstü */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki"
              className="absolute left-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/70 text-white backdrop-blur border border-white/10 transition hover:bg-red-600 hover:border-red-600 sm:flex"
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki"
              className="absolute right-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/70 text-white backdrop-blur border border-white/10 transition hover:bg-red-600 hover:border-red-600 sm:flex"
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Sayaç ve Sayfa Noktaları */}
        {count > 1 && (
          <div className="absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`${i + 1}. haber`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-red-600" : "w-2 bg-white/40 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
