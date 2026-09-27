import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "compact" | "horizontal" | "icon-only" | "footer";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  href?: string;
}

export default function Logo({
  variant = "default",
  size = "md",
  theme,
  showTagline = true,
  tagline = "ELEKTRİFİKASYON",
  className = "",
  href = "/",
}: LogoProps) {
  // Tema belirleme: footer için varsayılan dark, diğerleri için varsayılan light
  const isDark = theme ? theme === "dark" : variant === "footer";

  // Boyut ölçeklendirmeleri
  const emblemSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8 sm:w-9 sm:h-9",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-[22px]",
    lg: "text-2xl sm:text-[28px]",
  };

  const taglineSizes = {
    sm: "text-[7px] tracking-[0.24em]",
    md: "text-[8px] sm:text-[8.5px] tracking-[0.28em]",
    lg: "text-[9.5px] sm:text-[10px] tracking-[0.3em]",
  };

  // Kurumsal & Modern Dönüşüm ve Elektrifikasyon Danışmanı Amblemi
  // - İki dinamik orbital yay: Elektrikli Dönüşümü (Transition loop) simgeler
  // - 45° hassas pusula iğnesi: Geleceğe yol gösteren EV Danışmanı & Otopilot rehberliğini simgeler
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-all duration-300 group-hover:rotate-45 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="needleCyan" x1="20" y1="20" x2="29" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="arcGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        {/* 1. Sol Üst Dönüşüm Yayı (Gelenekselden Geleceğe Geçiş) */}
        <path
          d="M12 30C7.58 26.5 5 21 5 15C5 8.37 10.37 3 17 3C22 3 26.5 6 28.5 10.5"
          stroke={isDark ? "#FFFFFF" : "#0F172A"}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 2. Sağ Alt Elektrifikasyon Yayı (Temiz Enerjiye Varış) */}
        <path
          d="M28 10C32.42 13.5 35 19 35 25C35 31.63 29.63 37 23 37C18 37 13.5 34 11.5 29.5"
          stroke="url(#arcGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 3. Danışman Pusula İğnesi (Kuzeydoğu / 45° Gelecek & Yol Gösterici) */}
        {/* İleri/Yukarı Kanat: Elektrik Mavisi (Elektrifikasyon) */}
        <polygon points="20,20 28.5,11.5 21,11" fill={isDark ? "#38BDF8" : "#0284C7"} />
        <polygon points="20,20 28.5,11.5 29,19" fill={isDark ? "#7DD3FC" : "#0EA5E9"} />

        {/* Geri/Aşağı Kanat: Güven & Otorite (Koyu Antrasit / Beyaz) */}
        <polygon points="20,20 11.5,28.5 19,29" fill={isDark ? "#FFFFFF" : "#0F172A"} />
        <polygon points="20,20 11.5,28.5 11,21" fill={isDark ? "#94A3B8" : "#334155"} />

        {/* 4. Merkez Hassas Mil / Rulman Çekirdeği */}
        <circle
          cx="20"
          cy="20"
          r="2.2"
          fill={isDark ? "#0B132B" : "#FFFFFF"}
          stroke={isDark ? "#38BDF8" : "#0F172A"}
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );

  if (variant === "icon-only") {
    return href ? (
      <Link href={href} aria-label="EVOtoPilot Anasayfa" className={`inline-flex ${className}`}>
        {emblem}
      </Link>
    ) : (
      <div className={`inline-flex ${className}`}>{emblem}</div>
    );
  }

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {emblem}

      <div className="flex flex-col leading-none">
        {/* Ana Tipografi: Kurumsal, Tok ve Güçlü */}
        <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
          {/* EV */}
          <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-neutral-950"}`}>
            EV
          </span>

          {/* OTO */}
          <span className="font-black tracking-tight text-sky-600 dark:text-sky-400 mx-[2px]">
            OTO
          </span>

          {/* PİLOT */}
          <span className={`font-black tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-950"}`}>
            PİLOT
          </span>
        </div>

        {/* Tek Kelime Marka Sloganı / Dönüşüm Tanımı */}
        {showTagline && variant !== "compact" && (
          <div className="flex items-center mt-1">
            <span
              className={`font-black uppercase tracking-[0.28em] ${
                isDark ? "text-sky-400/90" : "text-sky-600"
              } ${taglineSizes[size]}`}
            >
              {tagline}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} aria-label="EVOtoPilot Anasayfa" className="inline-flex items-center focus:outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}
