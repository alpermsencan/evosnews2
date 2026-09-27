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
  className = "",
  href = "/",
}: LogoProps) {
  const isDark = theme ? theme === "dark" : variant === "footer";

  const emblemSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8 sm:w-9 sm:h-9",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-[23px]",
    lg: "text-2xl sm:text-[28px]",
  };

  // Yepyeni, modern aerodinamik hız ve otopilot kanatları (Supersonic Dual-Chevron)
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="supChevron" x1="14" y1="8" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        {/* 1. Sol Kanat: Stabilite & Gövde (Obsidian / Beyaz) */}
        <path
          d="M5 8.5L16.5 18L5 27.5H10.5L22 18L10.5 8.5H5Z"
          fill={isDark ? "#FFFFFF" : "#0F172A"}
        />

        {/* 2. Sağ Kanat: İleri Hız & Otopilot Vektörü (Elektrik Mavisi) */}
        <path
          d="M15 8.5L26.5 18L15 27.5H20.5L32 18L20.5 8.5H15Z"
          fill={isDark ? "#38BDF8" : "url(#supChevron)"}
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
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {emblem}

      {/* Tamamen Slogansız, Sade, Güçlü Tipografi */}
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
