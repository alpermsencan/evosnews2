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
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  // Modern Elektrikli "e" & Şarj Simgesi Bütünleşik Amblemi
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="eAracimBlue" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="eAracimDarkBase" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#1E293B" : "#0B132B"} />
            <stop offset="100%" stopColor={isDark ? "#0F172A" : "#1C2541"} />
          </linearGradient>
          <linearGradient id="eBoltGrad" x1="16" y1="8" x2="28" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* 1. Aerodinamik Gövde / Kalkan */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="11"
          fill="url(#eAracimDarkBase)"
          stroke={isDark ? "#334155" : "#0EA5E9"}
          strokeWidth="1.6"
        />

        {/* 2. Kusursuz ve Net Küçük 'e' Harfi (Lowercase "e" Anatomy) */}
        <path
          d="M13 23H31C31 16.5 26.8 12 21 12C14.5 12 10.5 17 10.5 23.5C10.5 30 14.8 35 21.5 35C26.5 35 30 32 31.2 27.5"
          stroke="url(#eAracimBlue)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Canlı Elektrik / Şarj Enerji Noktası */}
        <circle cx="33" cy="11.5" r="2.2" fill="#38BDF8" />
        <circle cx="33" cy="11.5" r="1.1" fill="#FFFFFF" />
      </svg>
    </div>
  );

  if (variant === "icon-only") {
    return href ? (
      <Link href={href} aria-label="e-aracım Anasayfa" className={`inline-flex ${className}`}>
        {emblem}
      </Link>
    ) : (
      <div className={`inline-flex ${className}`}>{emblem}</div>
    );
  }

  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {emblem}

      {/* Tipografi: e-aracım */}
      <div className="flex flex-col leading-none">
        <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
          {/* Elektrik Vurgulu 'e' */}
          <span className="text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]">
            e
          </span>
          {/* Tire */}
          <span className="text-sky-400/80 mx-0.5 font-bold">
            -
          </span>
          {/* aracım */}
          <span className={isDark ? "text-white" : "text-neutral-900"}>
            aracım
          </span>
          {/* .com kurumsal domain uzantısı */}
          <span className="text-[11px] sm:text-xs font-black text-sky-500 ml-1 tracking-wider opacity-85">
            .com
          </span>
        </div>

        {/* Alt Satır: Kurumsal Açıklama */}
        {showTagline !== false && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
            <span
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] select-none ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              ELEKTRİKLİ ARAÇ PLATFORMU
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} aria-label="e-aracım Anasayfa" className="inline-flex items-center focus:outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}
