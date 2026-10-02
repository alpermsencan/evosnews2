"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  alt?: string;
};

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  alt = "Araç Görseli",
}: Props) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  // Modal açıldığında index'i eşitle ve zoom'u sıfırla
  useEffect(() => {
    if (isOpen) {
      setActiveIdx(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const toggleDoubleZoom = useCallback(() => {
    setScale((prev) => {
      if (prev > 1.2) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return 2.2;
    });
  }, []);

  const goPrev = useCallback(() => {
    resetZoom();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length, resetZoom]);

  const goNext = useCallback(() => {
    resetZoom();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length, resetZoom]);

  // Klavye Kontrolleri: ESC, Sol/Sağ Ok, +, -
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goPrev, goNext, zoomIn, zoomOut, resetZoom]);

  // Mouse Wheel ile Yakınlaştırma / Uzaklaştırma
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxOffset = (scale - 1) * 350;
    setPosition({
      x: Math.max(Math.min(posStartRef.current.x + dx, maxOffset), -maxOffset),
      y: Math.max(Math.min(posStartRef.current.y + dy, maxOffset), -maxOffset),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobil Touch Events: Pinch-to-Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 parmak pinch başlangıcı
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && scale > 1) {
      // Tek parmak sürükleme (pan)
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStartRef.current = { ...position };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      // Pinch to zoom hesaplama
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / touchDistanceRef.current;
      setScale((prev) => Math.max(1, Math.min(prev * (ratio > 1 ? 1.03 : 0.97), 4)));
      touchDistanceRef.current = newDist;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Tek parmak pan
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      const maxOffset = (scale - 1) * 300;
      setPosition({
        x: Math.max(Math.min(posStartRef.current.x + dx, maxOffset), -maxOffset),
        y: Math.max(Math.min(posStartRef.current.y + dy, maxOffset), -maxOffset),
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentSrc = images[activeIdx] || "/arac-placeholder.svg";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
    >
      {/* ÜST BAR: Bilgi, Zoom Kontrolleri ve Kapatma */}
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Görsel Sayaç & Başlık */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white border border-white/10">
            {activeIdx + 1} / {images.length}
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-neutral-300 max-w-xs truncate">
            {alt}
          </span>
        </div>

        {/* Zoom Kontrol Düğmeleri */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 p-1 border border-white/15 backdrop-blur-md">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            title="Uzaklaştır (-)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition text-base font-bold"
          >
            －
          </button>

          <button
            type="button"
            onClick={resetZoom}
            title="Yakınlaştırmayı Sıfırla (100%)"
            className="px-2.5 py-1 text-xs font-black text-white hover:bg-white/20 rounded-full transition"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 4}
            title="Yakınlaştır (+)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition text-base font-bold"
          >
            ＋
          </button>
        </div>

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          title="Kapat (Esc)"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-red-600 transition text-lg font-black shadow-md"
        >
          ✕
        </button>
      </div>

      {/* ORTA: Büyük Resim Sahnesi & Pan/Zoom Alanı */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-zoom-in"
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={toggleDoubleZoom}
      >
        <div
          className="relative max-h-[82vh] max-w-[92vw] aspect-[16/10] w-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src={currentSrc}
            alt={`${alt} büyük görsel ${activeIdx + 1}`}
            fill
            sizes="92vw"
            priority
            className="object-contain pointer-events-none drop-shadow-2xl"
          />
        </div>

        {/* Sol Ok Butonu */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Önceki Görsel"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-white/25 transition text-2xl sm:text-3xl font-black z-20 border border-white/10"
          >
            ‹
          </button>
        )}

        {/* Sağ Ok Butonu */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Sonraki Görsel"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-white/25 transition text-2xl sm:text-3xl font-black z-20 border border-white/10"
          >
            ›
          </button>
        )}
      </div>

      {/* ALT BAR: Küçük Önizleme Küçük Resimleri (Thumbnails) & İpuçları */}
      <div className="w-full flex flex-col items-center gap-2 px-4 py-3 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Çift Tık & Yakınlaştırma İpucu */}
        <p className="text-[11px] font-semibold text-neutral-400 text-center">
          {scale > 1
            ? "Görseli parmağınız veya farenizle kaydırabilirsiniz · Çift tıklayarak sıfırlayın"
            : "Yakınlaştırmak için görsele çift tıklayın veya + düğmesini kullanın"}
        </p>

        {images.length > 1 && (
          <div className="flex max-w-full gap-2 overflow-x-auto p-1 no-scrollbar">
            {images.map((img, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    resetZoom();
                    setActiveIdx(idx);
                  }}
                  className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    isSelected
                      ? "border-sky-500 scale-105 shadow-md shadow-sky-500/30"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Küçük Resim ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
