import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "default" | "compact" | "horizontal" | "icon-only" | "footer";
  size?: "sm" | "md" | "lg" | "xl";
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
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-12 h-12 sm:w-14 sm:h-14",
    xl: "w-16 h-16 sm:w-20 sm:h-20",
  };

  const titleSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  // Yeni Logo Amblemi: Neon Mavi Çember, Elektrikli Araç Silüeti & Şimşekli "e" Harfi
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center rounded-full ${emblemSizes[size]} group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]`}>
      <Image
        src="/images/logo-emblem-badge.png"
        alt="e-aracım.com Logo"
        width={160}
        height={160}
        priority
        className="w-full h-full object-contain rounded-full"
      />
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

      {/* Tipografi: e-aracim.com & ELEKTRİKLİ ARAÇ REHBERİ */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
          {/* Neon Mavi Vurgulu 'e' */}
          <span className="text-[#00B4D8] drop-shadow-[0_0_10px_rgba(0,180,216,0.5)]">
            e
          </span>
          {/* Tire */}
          <span className="text-[#00B4D8]/90 mx-0.5 font-bold">
            -
          </span>
          {/* aracim */}
          <span className="text-[#00B4D8] drop-shadow-[0_0_8px_rgba(0,180,216,0.4)]">
            aracim
          </span>
          {/* .com kurumsal domain uzantısı (Beyaz / Koyu Kontrast) */}
          <span className={`font-black ml-0.5 tracking-tight ${isDark ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" : "text-neutral-900"}`}>
            .com
          </span>
        </div>

        {/* Alt Satır: Logodaki Resmi Slogan "ELEKTRİKLİ ARAÇ REHBERİ" */}
        {showTagline !== false && (
          <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
            <span
              className={`text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-[0.22em] select-none ${
                isDark ? "text-neutral-200" : "text-neutral-700"
              }`}
            >
              ELEKTRİKLİ ARAÇ REHBERİ
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
