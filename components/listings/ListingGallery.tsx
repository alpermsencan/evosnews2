"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function ListingGallery({ defaultImage, images = [], alt }: Props) {
  const allImages = [defaultImage, ...images].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);

  if (allImages.length <= 1) {
    return (
      <div className="relative aspect-[16/10] w-full bg-neutral-100 min-h-[300px]">
        <Image
          src={allImages[0] || defaultImage}
          alt={alt}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 720px"
          className="object-cover"
        />
      </div>
    );
  }

  const goPrev = () => {
    setActiveIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col w-full overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {/* Main Image Slider */}
      <div className="relative aspect-[16/10] w-full bg-neutral-100 overflow-hidden group min-h-[300px]">
        <Image
          src={allImages[activeIdx]}
          alt={`${alt} görsel ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 720px"
          className="object-cover transition duration-300"
        />

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10"
        >
          ›
        </button>

        {/* Counter indicator */}
        <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white z-10">
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
            className={`relative h-12 w-20 shrink-0 overflow-hidden rounded bg-neutral-200 border-2 transition ${
              idx === activeIdx ? "border-sky-500" : "border-transparent opacity-70 hover:opacity-100"
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
    </div>
  );
}
