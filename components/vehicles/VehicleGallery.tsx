"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconClose, IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";

type Props = {
  defaultImage: string;
  images: string[];
  alt: string;
};

export default function VehicleGallery({ defaultImage, images = [], alt }: Props) {
  const allImages = [defaultImage, ...images].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // --- AUTOMATIC SLIDESHOW INTERVAL ---
  useEffect(() => {
    if (allImages.length <= 1 || lightboxOpen) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }, 5000); // slide every 5 seconds

    return () => clearInterval(interval);
  }, [allImages.length, lightboxOpen]);

  // --- KEYBOARD LISTENERS FOR LIGHTBOX ---
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActiveIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      }
      if (e.key === "ArrowLeft") {
        setActiveIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  if (allImages.length === 0) {
    return (
      <div className="relative h-full w-full bg-neutral-100 min-h-[350px]">
        <Image
          src="/arac-placeholder.svg"
          alt={alt}
          fill
          priority
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
    <div className="flex flex-col h-full w-full select-none">
      
      {/* Main Image Slider with 16/9 larger visual block */}
      <div className="relative flex-1 aspect-[16/9] w-full bg-neutral-100 overflow-hidden group min-h-[350px]">
        <Image
          src={allImages[activeIdx]}
          alt={`${alt} görsel ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 750px"
          className="object-cover transition duration-300 hover:scale-[1.02] cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          onError={(e) => {
            // Safe fallback if image link fails on front-end
            (e.target as HTMLImageElement).src = "/arac-placeholder.svg";
          }}
        />

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 font-black text-xl z-10"
            >
              ›
            </button>
          </>
        )}

        {/* Counter indicator */}
        <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white z-10">
          {activeIdx + 1} / {allImages.length}
        </span>
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-3 bg-neutral-50 border-t border-neutral-150">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              type="button"
              className={`relative h-12 w-18 shrink-0 overflow-hidden rounded bg-neutral-200 border-2 transition ${
                idx === activeIdx ? "border-teal-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/arac-placeholder.svg";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* --- LIGHTBOX POPUP MODAL --- */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-[110] rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconClose className="h-5 w-5" />
          </button>

          {/* Left Arrow */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconChevronLeft className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-h-[85vh] max-w-[90vw] aspect-[16/10] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[activeIdx]}
              alt={`${alt} büyük görsel`}
              fill
              className="object-contain"
              priority
              loading="eager"
            />
            
            {/* Index Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-neutral-900/80 px-3 py-1 text-xs text-white">
              {activeIdx + 1} / {allImages.length}
            </div>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-700 transition"
          >
            <IconChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

    </div>
  );
}
