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

  // Dolubatarya standart marka logosu eşlemesi
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
        className="group block rounded-[15px] bg-[#F4F4F4] p-5 sm:p-6 transition-all duration-300 hover:shadow-md"
      >
        {/* 1. Marka Başlığı */}
        <div className="flex items-center">
          <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#1F1F1F] flex items-center justify-center overflow-hidden mr-2.5 shrink-0 shadow-2xs">
            {!logoFailed ? (
              <img
                src={brandLogoUrl}
                alt={vehicle.brand}
                className="w-[26px] h-[26px] object-contain rounded-full"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="text-[12px] font-black text-[#1F1F1F]">
                {vehicle.brand.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-[#1F1F1F]/60 capitalize">
            {vehicle.brand}
          </span>
        </div>

        {/* 2. Model İsmi */}
        <div className="mt-3.5 mb-4 min-h-[38px] max-h-[38px] overflow-hidden text-base font-medium text-[#1F1F1F] transition-colors duration-200 group-hover:text-[#05C46C] line-clamp-1">
          {vehicle.brand} {vehicle.model}
        </div>

        {/* 3. Model Görseli */}
        <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden rounded-[15px] bg-white">
          <SafeImage
            src={displayImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width:640px) 100vw, 360px"
            className="object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-105"
            fallbackSrc="/arac-placeholder.svg"
          />
        </div>

        {/* 4. Teknik Özellikler Satırı (Dolubatarya Stili) */}
        <div className="mt-6 flex flex-wrap items-center text-xs font-medium text-[#B3B3B3]">
          {/* Fiyat (Hover: Turuncu/Altın #C4A257) */}
          <div className="flex items-center mr-6 transition-colors group-hover:text-[#C4A257]">
            <svg
              className="w-4 h-4 mr-1.5 fill-current shrink-0 transition-colors"
              viewBox="0 0 18.359 18.247"
            >
              <path
                d="M24.986,33.189a1.027,1.027,0,0,0-.03-.3,1.086,1.086,0,0,0-1.118-.846c-2.144-.03-3.775-.03-5.769-.06H16.982l-1.087-.03c-1.993-.06-3.624-.091-5.769-.151a1.12,1.12,0,0,0-1.148.816,1.133,1.133,0,0,0-.03.3c-.06,2.235-.121,4.47-.151,6.675A1.047,1.047,0,0,0,9.884,40.74l7.4.181h.272l6.222.06A1.062,1.062,0,0,0,24.9,39.864C24.956,37.66,24.956,35.394,24.986,33.189Zm-4.108,6.192c-1.571-.03-2.839-.03-3.957-.03H16.8c-1.118-.03-2.386-.06-3.957-.091a2.051,2.051,0,0,0-1.51-1.6c.03-.816.06-1.661.06-2.688a1.883,1.883,0,0,0,1.54-1.359l.03-.06c.03-.03.03-.06.03-.121,1.45.03,2.718.06,3.957.091,1.269,0,2.537.03,3.957.03,0,.03.03.06.03.121l.03.06a1.922,1.922,0,0,0,1.48,1.42c0,1,0,1.873-.03,2.688A2.012,2.012,0,0,0,20.878,39.381Z"
                transform="translate(-6.628 -22.735)"
              />
              <path
                d="M18.739,10.157a1.094,1.094,0,0,0-.967-1.027c-2.114-.393-3.715-.695-5.678-1.057l-1.057-.181L9.98,7.681c-1.933-.393-3.534-.725-5.648-1.148a1.085,1.085,0,0,0-1.269.6,1.151,1.151,0,0,0-.091.3c-.453,2.175-.906,4.38-1.329,6.524a1.076,1.076,0,0,0,.876,1.329l.453.091.091-3.443a1.777,1.777,0,0,1,.06-.513A1.975,1.975,0,0,1,5,9.976c0-.03.03-.091.03-.121A1.846,1.846,0,0,0,6.778,8.768l.03-.06c.03-.03.03-.06.06-.091,1.42.272,2.658.544,3.9.785s2.477.453,3.9.725v.03c1.329,0,2.567.03,4.078.03v-.03Zm-3.926-3.5-.906-.634-.876-.634c-1.6-1.148-2.93-2.114-4.712-3.353a1.054,1.054,0,0,0-1.389.03.814.814,0,0,0-.211.242c-.785,1.118-1.6,2.235-2.386,3.353h.121c.936.181,1.752.362,2.567.513.181-.272.362-.513.574-.816a1.787,1.787,0,0,0,2.024-.272l.06-.03c.03-.03.06-.03.091-.06,1.178.846,2.2,1.571,3.232,2.3.03.03.06.03.091.06h.06c1.238.242,2.386.453,3.685.695-.664-.453-1.3-.906-2.024-1.389Z"
                transform="translate(-1.619 -1.787)"
              />
              <circle
                cx="1.722"
                cy="1.722"
                r="1.722"
                transform="translate(8.552 15.393) rotate(-89.516)"
              />
            </svg>
            <span className="font-medium text-[13px]">{formatTL(vehicle.price)}</span>
          </div>

          {/* Batarya / Şarj (Hover: Yeşil #8DA331) */}
          <div className="flex items-center transition-colors group-hover:text-[#8DA331]">
            <svg
              className="w-5 h-3 mr-1.5 fill-current shrink-0 transition-colors"
              viewBox="0 0 25.607 13.316"
            >
              <path d="M18.671,13.316H3.864A3.864,3.864,0,0,1,0,9.452V3.864A3.864,3.864,0,0,1,3.864,0H18.671a3.864,3.864,0,0,1,3.864,3.864V9.452a3.864,3.864,0,0,1-3.864,3.864M3.864,2.049A1.815,1.815,0,0,0,2.049,3.864V9.452a1.815,1.815,0,0,0,1.815,1.815H18.671a1.815,1.815,0,0,0,1.815-1.815V3.864a1.815,1.815,0,0,0-1.815-1.815Zm19.7,2.1V9.166a2.561,2.561,0,0,0,0-5.018" />
              <rect width="8.826" height="6.491" rx="0.954" transform="translate(3.671 3.413)" />
            </svg>
            <span className="font-medium text-[13px]">{vehicle.batteryKwh} kWh</span>
          </div>

          {/* Satır Ayırıcı */}
          <div className="w-full my-2"></div>

          {/* Menzil (Hover: Mor #9672DB) */}
          <div className="flex items-center mr-6 transition-colors group-hover:text-[#9672DB]">
            <svg
              className="w-4 h-4 mr-1.5 fill-current shrink-0 transition-colors"
              viewBox="0 0 20.406 16.247"
            >
              <path
                d="M19.859,18.466c-.517.048-1.324.129-2.454.258-.6.065-1.26.129-1.922.194l-.339-.388a6.736,6.736,0,0,0-2.358-1.55,7.221,7.221,0,0,0-2.955-.517,8.541,8.541,0,0,0-3.1.743,8.536,8.536,0,0,0-4.457,5.086,9.066,9.066,0,0,0-.42,3.682,6.427,6.427,0,0,0,.129.953,6.293,6.293,0,0,0,.226.953A9.468,9.468,0,0,0,2.968,29.7l-.323.226A9.915,9.915,0,0,1,1.4,27.493a10.339,10.339,0,0,1,18.457-9.026Z"
                transform="translate(-0.806 -13.684)"
              />
              <path
                d="M45.632,56.236a2.824,2.824,0,0,0,2.051,3,2.985,2.985,0,0,0,2.5-.468c1.324-.856,7.9-4.812,8.348-5.086a.523.523,0,0,0,.226-.614.532.532,0,0,0-.4-.355.447.447,0,0,0-.145-.016c-.436.032-9.188.969-10,1.033A2.769,2.769,0,0,0,45.632,56.236Z"
                transform="translate(-38.383 -46.4)"
              />
            </svg>
            <span className="font-medium text-[13px]">{vehicle.rangeKm} km</span>
          </div>

          {/* TR Satış Durumu (Hover: Kırmızı #D85453) */}
          <div className="flex items-center transition-colors group-hover:text-[#D85453]">
            <svg
              className="w-4 h-4 mr-1.5 fill-current shrink-0 transition-colors"
              viewBox="0 0 17.131 18.099"
            >
              <path
                d="M17.577,16.382,16.34,12.669H14.983l.754,3.62H2.464l.754-3.62H1.861L.623,16.382A1.228,1.228,0,0,0,1.861,18.1H16.34A1.227,1.227,0,0,0,17.577,16.382ZM13.625,4.525a4.525,4.525,0,1,0-9.05,0c0,4.321,4.525,9.05,4.525,9.05S13.625,8.846,13.625,4.525Zm-6.968.054A2.443,2.443,0,1,1,9.1,7.023,2.442,2.442,0,0,1,6.657,4.579Z"
                transform="translate(-0.535)"
              />
            </svg>
            <span className="font-medium text-[13px]">
              {isTrYok ? "TR'de Yok" : "TR'de Var"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
