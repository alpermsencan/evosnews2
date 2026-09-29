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

  // Yüksek Performanslı Şarj Olan Elektrikli Araç & EV Amblemi
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="evElectricBlueGrad" x1="10" y1="4" x2="34" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="evCarGrad" x1="4" y1="12" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#38BDF8" : "#0284C7"} />
            <stop offset="100%" stopColor={isDark ? "#0EA5E9" : "#0369A1"} />
          </linearGradient>
          <linearGradient id="evDarkShield" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1E293B" : "#0A0D14"} />
            <stop offset="100%" stopColor={isDark ? "#0F172A" : "#181E29"} />
          </linearGradient>
        </defs>

        {/* 1. Aerodinamik Karbon Kalkan */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="12"
          fill="url(#evDarkShield)"
          stroke={isDark ? "#334155" : "#E2E8F0"}
          strokeWidth="1.5"
        />

        {/* 2. Şarj Olan Elektrikli Araç Silüeti (Aerodynamic EV Car Silhouette) */}
        <path
          d="M7 27C8 24 11 21 16 20L22 17C26 15 31 16 34 18L37 21C39 23 40 25 40 27L40 29C40 30 39 31 38 31H36.5C36 29 34 27.5 32 27.5C30 27.5 28 29 27.5 31H17.5C17 29 15 27.5 13 27.5C11 27.5 9 29 8.5 31H6C5 31 4 30 4 29L4 27C4 26 5.5 25 7 27Z"
          fill="url(#evCarGrad)"
          opacity="0.95"
        />

        {/* Araç Camları */}
        <path
          d="M17 21.5L22 18.5C24.5 17.5 28 18 30.5 19.5L33 21.5H17Z"
          fill="#FFFFFF"
          fillOpacity={isDark ? "0.2" : "0.35"}
        />

        {/* Ön & Arka Tekerlekler */}
        <circle cx="13" cy="31" r="3.2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
        <circle cx="13" cy="31" r="1.2" fill="#38BDF8" />
        <circle cx="32" cy="31" r="3.2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
        <circle cx="32" cy="31" r="1.2" fill="#38BDF8" />

        {/* 3. Şarj İstasyonu & Kablosu: Araca Takılı Şarj Girişi (Charging Cable & Plug) */}
        <path
          d="M7 12V24C7 26 9 27 11 27"
          stroke="#38BDF8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="2 2"
          className="animate-ev-charge-flow"
        />

        {/* 4. Şarj Bıçağı / Şimşek (High-Voltage EV Energy) */}
        <path
          d="M25 6L17 17H23L20 25L30 14H24L26 6H25Z"
          fill="url(#evElectricBlueGrad)"
          className="animate-ev-charge-bolt"
        />

        {/* 5. Aktif Şarj Dolum LED'i */}
        <circle cx="35" cy="8" r="3" className="animate-ping fill-sky-400 opacity-75 origin-[35px_8px]" />
        <circle cx="35" cy="8" r="2" fill="#0284C7" />
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

      {/* Tipografi ve Şarj Olan Elektrikli Araç (EV) Bütünleşik Tasarımı */}
      <div className="flex flex-col leading-none">
        {/* Üst Satır: Şarj Olan Araç Rozeti + EV + OTOPİLOT */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Şarj Olan Araç + EV Bütünleşik Kapsülü */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white font-black text-[11px] sm:text-xs tracking-wider ring-1 ring-sky-400/50 select-none shadow-[0_0_14px_rgba(14,165,233,0.45)]">
            {/* Şarj Olan Araba İkonu */}
            <svg className="w-3.5 h-3.5 fill-current text-sky-200 shrink-0" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
            {/* Şarj Şimşeği */}
            <svg className="w-3 h-3 fill-current shrink-0 animate-pulse text-cyan-200 drop-shadow-[0_0_5px_rgba(56,189,248,0.9)]" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="tracking-widest font-black">EV</span>
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

        {/* Alt Satır: Şarj Olan Elektrikli Araç Rehberi */}
        {showTagline !== false && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping shrink-0" />
            <span
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] select-none ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {size === "sm" ? "ELEKTRİKLİ ARAÇ DANIŞMANI" : "ELEKTRİKLİ ARAÇ REHBERİ"}
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
