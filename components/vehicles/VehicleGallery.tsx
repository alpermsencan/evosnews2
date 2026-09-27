"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function VehicleGallery({ defaultImage, images = [], alt }: Props) {
  // Combine default image and extra images
  const allImages = [defaultImage, ...images].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({});

  const getImageSrc = (url: string) => {
    if (!url || failedMap[url]) return "/arac-placeholder.svg";
    return url;
  };

  if (allImages.length <= 1) {
    const singleSrc = getImageSrc(allImages[0] || defaultImage);
    return (
      <div className="relative h-full w-full bg-neutral-100 min-h-[300px]">
        <Image
          src={singleSrc}
          alt={alt}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 660px"
          className="object-cover"
          onError={() => {
            if (allImages[0]) setFailedMap((prev) => ({ ...prev, [allImages[0]]: true }));
          }}
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

  const currentRaw = allImages[activeIdx] || defaultImage;
  const currentSrc = getImageSrc(currentRaw);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Image Slider */}
      <div className="relative flex-1 aspect-[16/10] w-full bg-neutral-100 overflow-hidden group min-h-[300px]">
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={`${alt} görsel ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 660px"
          className="object-cover transition duration-300"
          onError={() => {
            setFailedMap((prev) => ({ ...prev, [currentRaw]: true }));
          }}
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
        {allImages.map((img, idx) => {
          const thumbSrc = getImageSrc(img);
          return (
            <button
              key={`${img}-${idx}`}
              onClick={() => setActiveIdx(idx)}
              type="button"
              className={`relative h-12 w-18 shrink-0 overflow-hidden rounded bg-neutral-200 border-2 transition ${
                idx === activeIdx ? "border-sky-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={thumbSrc}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
                onError={() => {
                  setFailedMap((prev) => ({ ...prev, [img]: true }));
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
