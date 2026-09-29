import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "compact" | "horizontal" | "icon-only" | "footer";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({
  variant = "default",
  size = "md",
  theme,
  showTagline = true,
  className = "",
  href = "/",
}: LogoProps) {
  const isDark = theme ? theme === "dark" : variant === "footer";

  const emblemSizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9 sm:w-10 sm:h-10",
    lg: "w-11 h-11 sm:w-12 sm:h-12",
  };

  const titleSizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-[22px]",
    lg: "text-xl sm:text-[26px]",
  };

  // Yüksek Performanslı Elektrikli Araç & Şimşek Amblemi
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="evRedGrad" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="evDarkGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1F2937" : "#0A0D14"} />
            <stop offset="100%" stopColor={isDark ? "#111827" : "#181E29"} />
          </linearGradient>
        </defs>

        {/* 1. Aerodinamik Karbon Kalkan */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill="url(#evDarkGrad)"
          stroke={isDark ? "#374151" : "#E2E8F0"}
          strokeWidth="1.5"
        />

        {/* 2. Sol Aerodinamik Hız Kanadı */}
        <path
          d="M8 26L16 11H11L7 26Z"
          fill={isDark ? "#6B7280" : "#94A3B8"}
          fillOpacity="0.4"
        />

        {/* 3. Ana Elektrikli Şimşek & Şarj Bıçağı (High-Voltage EV Lightning) */}
        <path
          d="M22 6L11 21H19L16 34L29 17H21L24 6H22Z"
          fill="url(#evRedGrad)"
          className="animate-ev-bolt"
        />

        {/* 4. Şimşek İç Enerji Parlaması */}
        <path
          d="M21 9L14 20H20L18 28L25 18H20L22 9H21Z"
          fill="#FFFFFF"
          className="animate-ev-spark"
        />

        {/* 5. Aktif Güç / Şarj Diyotu */}
        <circle cx="31" cy="9" r="2.5" className="animate-ping fill-red-400 opacity-75 origin-[31px_9px]" />
        <circle cx="31" cy="9" r="2" fill="#EF4444" />
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
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {emblem}

      {/* Tipografi ve Elektrikli Araç (EV) Vurgusu */}
      <div className="flex flex-col leading-none">
        {/* Üst Satır: ⚡ EV Rozeti + OTOPİLOT */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* EV (Electric Vehicle) Rozeti: Türkçe 'Ev' ile karışmayı %100 önleyen elektrik şimşekli kapsül */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-[11px] sm:text-xs tracking-wider ring-1 ring-red-500/40 select-none shadow-[0_0_10px_rgba(239,68,68,0.35)]">
            <svg className="w-3 h-3 fill-current shrink-0 animate-pulse text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.8)]" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="tracking-wide">EV</span>
          </span>

          {/* OTOPİLOT Kelimesi */}
          <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
            <span className={isDark ? "text-white" : "text-neutral-950"}>
              OTO
            </span>
            <span className="text-red-600 dark:text-red-500 ml-0.5">
              PİLOT
            </span>
          </div>
        </div>

        {/* Alt Satır: Elektrikli Araç Danışmanı Belirteci */}
        {showTagline !== false && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1 w-1 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] select-none ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {size === "sm" ? "ELEKTRİKLİ ARAÇ" : "ELEKTRİKLİ ARAÇ DANIŞMANI"}
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
