"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ImageLightboxModal from "@/components/ui/ImageLightboxModal";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function ListingTouchGallery({ defaultImage, images = [], alt }: Props) {
  const allImages = Array.from(new Set([defaultImage, ...images].filter(Boolean)));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      setActiveIdx(idx);
    }
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: idx * clientWidth,
      behavior: "smooth",
    });
    setActiveIdx(idx);
  };

  const goPrev = () => {
    const nextIdx = activeIdx === 0 ? allImages.length - 1 : activeIdx - 1;
    scrollToIndex(nextIdx);
  };

  const goNext = () => {
    const nextIdx = activeIdx === allImages.length - 1 ? 0 : activeIdx + 1;
    scrollToIndex(nextIdx);
  };

  if (allImages.length <= 1) {
    const singleImg = allImages[0] || defaultImage;
    return (
      <>
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-neutral-200 cursor-pointer"
        >
          <Image
            src={singleImg}
            alt={alt}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 760px"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition group-hover:bg-black/80">
            <span>🔍 Büyüt &amp; Yakınlaştır</span>
          </div>
        </div>

        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={[singleImg]}
          initialIndex={0}
          alt={alt}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Parmakla Kaydırılabilir (Touch Swipe Slider) Ana Resim Alanı */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar select-none cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {allImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveIdx(idx);
                setIsLightboxOpen(true);
              }}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden cursor-zoom-in"
            >
              <Image
                src={img}
                alt={`${alt} görsel ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width:1024px) 100vw, 760px"
                className="object-cover transition duration-300 group-hover:scale-[1.01]"
              />
            </div>
          ))}
        </div>

        {/* Büyüt & Yakınlaştır Düğmesi */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/85 z-10 shadow"
        >
          <span>🔍 Büyüt &amp; Yakınlaştır</span>
        </button>

        {/* Masaüstü Gezinme Okları */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          type="button"
          aria-label="Önceki Görsel"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10 backdrop-blur"
        >
          ‹
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          type="button"
          aria-label="Sonraki Görsel"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10 backdrop-blur"
        >
          ›
        </button>

        {/* Sayaç Göstergesi */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-black text-white z-10 backdrop-blur">
          {activeIdx + 1} / {allImages.length}
        </div>

        {/* Swipe İpucu / Dot Göstergeleri */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Küçük Önizleme Şeridi */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto p-2.5 bg-neutral-50 border-t border-neutral-100">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToIndex(idx)}
            className={`relative h-12 w-16 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
              idx === activeIdx
                ? "border-sky-500 ring-2 ring-sky-500/20"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Tam Ekran & Yakınlaştırma Modalı */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        initialIndex={activeIdx}
        alt={alt}
      />
    </div>
  );
}
