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
}: {
  vehicles: ShowcaseVehicle[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const count = vehicles.length;

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, count, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!count) return null;

  const activeVehicle = vehicles[currentIndex];

  return (
    <div
      className="relative flex flex-col rounded-3xl border border-neutral-300/80 bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5 overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 1. ÜST BAŞLIK & SLIDER NAVİGASYONU */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
                ÖNE ÇIKAN VİTRİN MODELLERİ
              </h2>
              <span className="rounded bg-sky-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                VİTRİN
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium hidden sm:block">
              Türkiye pazarının en çok tercih edilen elektrikli modelleri ve resmî verileri
            </p>
          </div>
        </div>

        {/* Sağ: İleri / Geri Navigasyon Okları & Sayaç */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki model"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-950 hover:text-white transition shadow-2xs"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-black text-neutral-500 px-1">
            {currentIndex + 1} / {count}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Sonraki model"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-950 hover:text-white transition shadow-2xs"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. BÜYÜK KURUMSAL VİTRİN TUVALİ: BİLGİLER RESMİN ÜZERİNE KURUMSAL & RENKLİ YERLEŞTİRİLDİ */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-slate-900 to-neutral-900 border border-neutral-800 shadow-lg group">
        {/* Arka Plan Hafif Enerji Işıması */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        {/* BÜYÜK ARAÇ GÖRSELİ */}
        <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-10">
          <SafeImage
            src={activeVehicle.image}
            alt={`${activeVehicle.brand} ${activeVehicle.model}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-contain p-4 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackSrc="/arac-placeholder.svg"
          />
        </div>

        {/* ÜST SOL: Kasa Tipi & Marka */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2 z-10">
          <span className="rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-xs">
            {activeVehicle.body}
          </span>
          <span className="rounded-lg bg-blue-600/80 backdrop-blur-md border border-blue-400/30 px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-200">
            {activeVehicle.brand}
          </span>
        </div>

        {/* ÜST SAĞ: Durum / Kampanya Etiketi */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10">
          <span
            className={`rounded-lg px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md ${activeVehicle.tagColor}`}
          >
            {activeVehicle.tag}
          </span>
        </div>

        {/* ALT ŞERİT: MODEL BAŞLIĞI, FİYAT & RENKLİ METRİKLER (RESİM ÜZERİNDE) */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          {/* Sol Kısım: Model İsmi ve Fiyat */}
          <div className="flex flex-col gap-1">
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {activeVehicle.brand} {activeVehicle.model}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase">
                Başlangıç:
              </span>
              <span className="text-base sm:text-xl font-black text-sky-400 tracking-tight drop-shadow-sm">
                {formatTL(activeVehicle.price)}
              </span>
            </div>
          </div>

          {/* Sağ Kısım: Renkli Kurumsal Metrik Çipleri & Buton */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Menzil (Yeşil) */}
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 backdrop-blur-md px-2.5 py-1.5 shadow-xs">
              <span className="text-emerald-400 text-xs">🔋</span>
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-black uppercase text-emerald-300">WLTP Menzil</span>
                <span className="text-xs sm:text-sm font-black text-white">{activeVehicle.range} km</span>
              </div>
            </div>

            {/* Motor Gücü (Turuncu) */}
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 backdrop-blur-md px-2.5 py-1.5 shadow-xs">
              <span className="text-amber-400 text-xs">⚡</span>
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-black uppercase text-amber-300">Güç</span>
                <span className="text-xs sm:text-sm font-black text-white">{activeVehicle.power}</span>
              </div>
            </div>

            {/* Hızlı Şarj (Mavi) */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-sky-950/70 border border-sky-500/40 backdrop-blur-md px-2.5 py-1.5 shadow-xs">
              <span className="text-sky-400 text-xs">⏱️</span>
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-black uppercase text-sky-300">Hızlı Şarj</span>
                <span className="text-xs sm:text-sm font-black text-white">{activeVehicle.dcSpeed}</span>
              </div>
            </div>

            {/* İncele Butonu */}
            <Link
              href={`/araclar/${activeVehicle.slug}`}
              className="rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 px-3.5 py-2 text-xs font-black transition active:scale-95 shadow-md flex items-center gap-1 shrink-0"
            >
              <span>İncele</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. ALT MİNİ MODEL SEÇİCİ ŞERİT (Hızlı ve Hafif) */}
      <div className="mt-3 pt-3 border-t border-neutral-200">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 overscroll-x-contain touch-pan-x">
          {vehicles.map((v, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={v.slug}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition shrink-0 ${
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-xs font-black"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 font-bold"
                }`}
              >
                <div className="relative h-5 w-8 shrink-0 overflow-hidden rounded bg-white border border-neutral-200">
                  <SafeImage
                    src={v.image}
                    alt={v.model}
                    fill
                    sizes="32px"
                    className="object-contain p-0.5"
                    fallbackSrc="/arac-placeholder.svg"
                  />
                </div>
                <span className="text-[11px] truncate max-w-[120px]">
                  {v.brand} {v.model}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
