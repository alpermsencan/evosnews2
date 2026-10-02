"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageLightboxModal from "@/components/ui/ImageLightboxModal";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function ModernVehicleGallery({
  defaultImage,
  images = [],
  alt,
}: Props) {
  // Orijinal ana görsel ve galeri görsellerini birleştir
  const allImages = Array.from(
    new Set([defaultImage, ...images].filter(Boolean))
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getImageSrc = (url: string) => {
    if (!url || failedMap[url]) return "/arac-placeholder.svg";
    return url;
  };

  const goPrev = () => {
    setActiveIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Klavye ok tuşları ve Escape dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allImages.length, isLightboxOpen]);

  const currentRaw = allImages[activeIdx] || defaultImage;
  const currentSrc = getImageSrc(currentRaw);

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
      {/* Ana Görsel Sahnesi */}
      <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full bg-neutral-950 overflow-hidden group select-none">
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={`${alt} görsel ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 750px"
          className="object-cover transition duration-500 group-hover:scale-[1.02] cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
          onError={() => {
            setFailedMap((prev) => ({ ...prev, [currentRaw]: true }));
          }}
        />

        {/* Büyüteç / Tam Ekran Butonu */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/85 z-10 text-sm shadow"
          title="Tam Ekran İncele"
        >
          🔍
        </button>

        {/* Sol / Sağ Ok Butonları */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/85 font-black text-2xl z-10 opacity-80 group-hover:opacity-100"
              aria-label="Önceki Görsel"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/85 font-black text-2xl z-10 opacity-80 group-hover:opacity-100"
              aria-label="Sonraki Görsel"
            >
              ›
            </button>
          </>
        )}

        {/* Görsel Sayacı */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md z-10">
            {activeIdx + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Küçük Önizleme Şeridi (Thumbnails) */}
      {allImages.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto p-3 bg-neutral-900 border-t border-neutral-800">
          {allImages.map((img, idx) => {
            const thumbSrc = getImageSrc(img);
            const isSelected = idx === activeIdx;
            return (
              <button
                key={`${img}-${idx}`}
                onClick={() => setActiveIdx(idx)}
                type="button"
                className={`relative h-14 w-22 shrink-0 overflow-hidden rounded-lg transition border-2 ${
                  isSelected
                    ? "border-emerald-500 scale-105 shadow-md shadow-emerald-500/20"
                    : "border-neutral-700 opacity-60 hover:opacity-100 hover:border-neutral-500"
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`Önizleme ${idx + 1}`}
                  fill
                  sizes="88px"
                  className="object-cover"
                  onError={() => {
                    setFailedMap((prev) => ({ ...prev, [img]: true }));
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Tam Ekran & Yakınlaştırılabilir Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages.map((img) => getImageSrc(img))}
        initialIndex={activeIdx}
        alt={alt}
      />
    </div>
  );
}
