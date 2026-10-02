"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightboxModal from "@/components/ui/ImageLightboxModal";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function ListingGallery({ defaultImage, images = [], alt }: Props) {
  const allImages = Array.from(new Set([defaultImage, ...images].filter(Boolean)));
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (allImages.length <= 1) {
    const singleImg = allImages[0] || defaultImage;
    return (
      <>
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group relative aspect-[16/10] w-full bg-neutral-100 min-h-[300px] cursor-pointer overflow-hidden rounded-2xl border border-neutral-200"
        >
          <Image
            src={singleImg}
            alt={alt}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 720px"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
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

  const goPrev = () => {
    setActiveIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Main Image Slider */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="relative aspect-[16/10] w-full bg-neutral-100 overflow-hidden group min-h-[300px] cursor-zoom-in"
      >
        <Image
          src={allImages[activeIdx]}
          alt={`${alt} görsel ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 720px"
          className="object-cover transition duration-300 group-hover:scale-[1.01]"
        />

        {/* Büyüt Düğmesi */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/85 z-10"
        >
          <span>🔍 Büyüt &amp; Yakınlaştır</span>
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10 backdrop-blur"
        >
          ‹
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10 backdrop-blur"
        >
          ›
        </button>

        {/* Counter indicator */}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black text-white z-10 backdrop-blur">
          {activeIdx + 1} / {allImages.length}
        </span>
      </div>

      {/* Thumbnails Row */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto p-3 bg-neutral-50 border-t border-neutral-150">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            type="button"
            className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
              idx === activeIdx ? "border-sky-500 ring-2 ring-sky-500/20" : "border-transparent opacity-70 hover:opacity-100"
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

      {/* Lightbox Modal */}
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
