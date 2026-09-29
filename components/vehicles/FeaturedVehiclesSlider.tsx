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
      className="relative flex flex-col rounded-3xl border border-neutral-300/80 bg-white p-5 sm:p-7 shadow-sm ring-1 ring-black/5 overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 1. ÜST BAŞLIK & SLIDER NAVİGASYONU */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 uppercase">
                ÖNE ÇIKAN VİTRİN MODELLERİ
              </h2>
              <span className="rounded bg-neutral-950 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                VİTRİN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-0.5">
              Türkiye pazarının en çok tercih edilen elektrikli modelleri ve teknik özellikleri
            </p>
          </div>
        </div>

        {/* Sağ: İleri / Geri Navigasyon Okları */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki model"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-950 hover:text-white transition shadow-2xs"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-950 hover:text-white transition shadow-2xs"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. BÜYÜK KURUMSAL VİTRİN SLAYT ALANI (Geniş & Etkileyici) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sol 7 Kolon: Büyük Yüksek Çözünürlüklü Araç Görseli */}
        <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200/90 shadow-xs flex items-center justify-center group">
          <SafeImage
            src={activeVehicle.image}
            alt={`${activeVehicle.brand} ${activeVehicle.model}`}
            fill
            sizes="(max-width:1024px) 100vw, 750px"
            className="object-contain p-4 sm:p-6 transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackSrc="/arac-placeholder.svg"
          />

          {/* Kasa Tipi Rozeti */}
          <div className="absolute top-3 left-3 rounded-lg bg-neutral-950/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
            {activeVehicle.body}
          </div>

          {/* Kampanya / Statü Rozeti */}
          <div
            className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-xs ${activeVehicle.tagColor}`}
          >
            {activeVehicle.tag}
          </div>
        </div>

        {/* Sağ 5 Kolon: Araç Bilgileri & Büyük Teknik Metrikler */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black tracking-widest uppercase text-neutral-500">
                {activeVehicle.brand} RESMÎ MODELİ
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-tight">
              {activeVehicle.brand} {activeVehicle.model}
            </h3>

            {/* Fiyat Bilgisi */}
            <div className="mt-3 flex items-baseline gap-2 pb-3 border-b border-neutral-200">
              <span className="text-xs font-black text-neutral-500 uppercase">
                Başlangıç Fiyatı:
              </span>
              <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                {formatTL(activeVehicle.price)}
              </span>
            </div>

            {/* Büyük 4'lü Metrik Tablosu */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200/90">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Menzil (WLTP)
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">
                  {activeVehicle.range} km
                </span>
              </div>

              <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200/90">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Motor Gücü
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">
                  {activeVehicle.power}
                </span>
              </div>

              <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200/90">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  DC Hızlı Şarj
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">
                  {activeVehicle.dcSpeed}
                </span>
              </div>

              <div className="flex flex-col p-3 rounded-xl bg-neutral-50 border border-neutral-200/90">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  0-100 Hızlanma
                </span>
                <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">
                  {activeVehicle.acceleration || "6.9 sn"}
                </span>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/araclar/${activeVehicle.slug}`}
              className="flex-1 rounded-xl bg-neutral-950 py-3 text-center text-xs font-black text-white hover:bg-red-600 transition shadow-xs"
            >
              Model Detaylarını İncele →
            </Link>
            <Link
              href="/karsilastir"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-xs font-black text-neutral-800 hover:bg-neutral-100 transition shadow-2xs"
            >
              Karşılaştır
            </Link>
          </div>
        </div>
      </div>

      {/* 3. ALT MODEL LİSTESİ ŞERİDİ (Mini Küçük Görsel Seçiciler) */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-1 overscroll-x-contain touch-pan-x">
          {vehicles.map((v, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={v.slug}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition shrink-0 ${
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-xs font-black"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 font-bold"
                }`}
              >
                <div className="relative h-6 w-9 shrink-0 overflow-hidden rounded bg-white border border-neutral-200">
                  <SafeImage
                    src={v.image}
                    alt={v.model}
                    fill
                    sizes="36px"
                    className="object-contain p-0.5"
                    fallbackSrc="/arac-placeholder.svg"
                  />
                </div>
                <span className="text-xs truncate max-w-[130px]">
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
