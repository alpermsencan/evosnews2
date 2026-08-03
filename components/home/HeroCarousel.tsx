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
  publishedAt: string | Date;
  category: { name: string; slug: string; color: string };
};

export default function HeroCarousel({
  slides,
  interval = 5500,
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
      className="relative w-full overflow-hidden bg-black sm:rounded-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((s, i) => (
          <Link
            key={s.id}
            href={`/haber/${s.slug}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

            <div
              className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 pb-10 transition-opacity duration-200 sm:gap-3 sm:p-6 sm:pb-12 lg:p-8 lg:pb-14 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {s.isBreaking && (
                  <span className="rounded bg-evos px-2 py-1 text-[10px] font-black tracking-wide text-white sm:text-xs">
                    SON DAKİKA
                  </span>
                )}
                <span
                  className="rounded px-2 py-1 text-[10px] font-black tracking-wide text-white sm:text-xs"
                  style={{ backgroundColor: s.category.color }}
                >
                  {s.category.name.toUpperCase()}
                </span>
                {s.isVideo && (
                  <span className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] font-bold text-white backdrop-blur sm:text-xs">
                    <IconPlay className="h-3 w-3" /> VİDEO
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] font-semibold text-white/70">
                  <IconClock className="h-3 w-3" />
                  {timeAgo(s.publishedAt)}
                </span>
              </div>

              <h2 className="max-w-4xl text-[22px] font-black leading-[1.15] text-white drop-shadow-lg sm:text-3xl lg:text-[42px]">
                {s.title}
              </h2>
              <p className="hidden max-w-2xl text-sm text-white/80 sm:line-clamp-2 lg:text-base">
                {s.spot}
              </p>
            </div>
          </Link>
        ))}

        {/* Oklar - masaüstü */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki"
              className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-evos sm:flex"
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki"
              className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-evos sm:flex"
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Noktalar */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`${i + 1}. haber`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-evos" : "w-2.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
