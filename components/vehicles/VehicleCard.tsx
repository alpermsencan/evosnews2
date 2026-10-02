"use client";

import Link from "next/link";
import { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { formatTL } from "@/lib/utils";

export type VehicleLite = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
  rangeKm: number;
  batteryKwh: number;
  acceleration: number;
  segment: string;
  motorPowerHp: number;
  marketStatus?: string;
  dcChargeKw: number | null;
  rating: number | null;
  syncImages?: {
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }[];
};

export default function VehicleCard({ vehicle }: { vehicle: VehicleLite }) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Doğrulanmış senkronize görseli öncelikle seç
  const syncImages = vehicle.syncImages || [];
  let displayImage =
    vehicle.image && !vehicle.image.startsWith("/media/")
      ? vehicle.image
      : "/arac-placeholder.svg";

  if (syncImages && syncImages.length > 0) {
    const validSync = syncImages.filter(
      (img) =>
        img.type !== "ignored" &&
        !img.url.includes("togg-t10x-iaa-2025.jpg") &&
        !img.url.startsWith("/media/")
    );
    const primaryImg = validSync.find((img) => img.isPrimary) || validSync[0];
    if (primaryImg?.url) {
      displayImage = primaryImg.url;
    }
  }

  if (!displayImage || displayImage.trim() === "" || displayImage.startsWith("/media/")) {
    displayImage = "/arac-placeholder.svg";
  }

  // Standart marka logosu eşlemesi
  const cleanBrand = vehicle.brand.toLowerCase().trim();
  const brandSlugMap: Record<string, string> = {
    mercedes: "mercedes-benz",
    "mercedes-benz": "mercedes-benz",
    vw: "volkswagen",
    volkswagen: "volkswagen",
  };
  const brandSlug = brandSlugMap[cleanBrand] || cleanBrand.replace(/\s+/g, "-");
  const brandLogoUrl = `https://dolubatarya.com/images/brands/${brandSlug}-logo.png`;

  const isTrYok = vehicle.marketStatus === "TR_YOK";

  return (
    <article className="car-box w-full">
      <Link
        href={`/araclar/${vehicle.slug}`}
        title={`${vehicle.brand} ${vehicle.model}`}
        className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/20 hover:bg-white/80 p-4 transition-all duration-300 hover:border-neutral-300 hover:shadow-lg h-full backdrop-blur-xs"
      >
        <div>
          {/* 1. Üst Kısım: Marka Logosu & Adı, Segment */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {!logoFailed ? (
                  <img
                    src={brandLogoUrl}
                    alt={vehicle.brand}
                    className="w-4 h-4 object-contain"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="text-[9px] font-black text-neutral-800">
                    {vehicle.brand.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                {vehicle.brand}
              </span>
            </div>

            {vehicle.segment && (
              <span className="rounded-md bg-neutral-100/90 px-2 py-0.5 text-[10px] font-bold text-neutral-500 uppercase">
                {vehicle.segment}
              </span>
            )}
          </div>

          {/* 2. Model İsmi (Ön Planda, Büyük & Kalın) */}
          <h3 className="mb-2 text-base sm:text-lg font-black text-neutral-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>

          {/* 3. BÜYÜTÜLMÜŞ, ŞEFFAF VE NET MODEL GÖRSELİ */}
          <div className="relative w-full h-[210px] sm:h-[230px] overflow-hidden rounded-xl bg-neutral-100/40 hover:bg-neutral-100/70 border border-neutral-200/50 flex items-center justify-center p-2 transition-colors">
            <SafeImage
              src={displayImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width:640px) 100vw, 380px"
              className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
              fallbackSrc="/arac-placeholder.svg"
            />
          </div>
        </div>

        {/* 4. NET FİYAT & SADE TEKNİK METRİKLER */}
        <div className="mt-3.5 pt-3 border-t border-neutral-200/60 flex flex-col gap-2">
          {/* Fiyat Satırı */}
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">
              Başlangıç
            </span>
            <span className="text-base sm:text-lg font-black text-neutral-950 tracking-tight group-hover:text-sky-600 transition-colors">
              {formatTL(vehicle.price)}
            </span>
          </div>

          {/* 3'lü Sade Rozetler (Menzil, Batarya, Pazar Durumu) */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg bg-neutral-100/70 border border-neutral-200/60 py-1.5 px-1">
              <span className="block text-[9px] font-bold text-neutral-400 uppercase">
                Menzil
              </span>
              <strong className="block text-xs font-black text-neutral-900">
                {vehicle.rangeKm} km
              </strong>
            </div>

            <div className="rounded-lg bg-neutral-100/70 border border-neutral-200/60 py-1.5 px-1">
              <span className="block text-[9px] font-bold text-neutral-400 uppercase">
                Batarya
              </span>
              <strong className="block text-xs font-black text-neutral-900">
                {vehicle.batteryKwh} kWh
              </strong>
            </div>

            <div className="rounded-lg bg-neutral-100/70 border border-neutral-200/60 py-1.5 px-1 flex flex-col justify-center">
              <span className="block text-[9px] font-bold text-neutral-400 uppercase">
                Durum
              </span>
              <strong
                className={`block text-[10px] font-black ${
                  isTrYok ? "text-amber-600" : "text-emerald-700"
                }`}
              >
                {isTrYok ? "TR'de Yok" : "TR Satışta"}
              </strong>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
