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
    lg: "text-2xl sm:text-3xl",
  };

  const taglineSizes = {
    sm: "text-[7.5px] tracking-[0.18em]",
    md: "text-[8.5px] tracking-[0.2em]",
    lg: "text-[9.5px] tracking-[0.22em]",
  };

  // Sade, geometrik ve profesyonel amblem (Gereksiz parıltı ve neon halelerden arındırılmış)
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-200"
      >
        <defs>
          <linearGradient id="emblemDark" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="emblemAccent" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        {/* Dış Geometrik Çerçeve (Minimalist Faset) */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="9"
          fill={isDark ? "url(#emblemDark)" : "#0F172A"}
          stroke={isDark ? "#334155" : "#1E293B"}
          strokeWidth="1.5"
        />

        {/* Sol "E" ve İleri Yön Geometrisi */}
        <path
          d="M10 11H23C24.1 11 25 11.9 25 13C25 14.1 24.1 15 23 15H14V17H21C22.1 17 23 17.9 23 19C23 20.1 22.1 21 21 21H14V23H23C24.1 23 25 23.9 25 25C25 26.1 24.1 27 23 27H10V11Z"
          fill="#FFFFFF"
        />

        {/* Sağ Otomotiv / Autopilot Vektör Çentiği (Zarif Turkuaz/Mavi Vurgu) */}
        <path
          d="M21 11L26.5 18L21 25H24.5L29 18L24.5 11H21Z"
          fill="url(#emblemAccent)"
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
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {emblem}

      <div className="flex flex-col leading-none">
        {/* Ana Tipografi: Sade, Güçlü, Okunaklı */}
        <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
          {/* EVO */}
          <span className={isDark ? "text-white" : "text-neutral-900"}>
            EVO
          </span>

          {/* to */}
          <span className="text-sky-600 font-extrabold mx-[1.5px] text-[0.88em]">
            to
          </span>

          {/* Pilot */}
          <span className={isDark ? "text-neutral-200" : "text-neutral-900"}>
            Pilot
          </span>
        </div>

        {/* Alt Kurumsal Başlık (Temiz & Zarif) */}
        {showTagline && variant !== "compact" && (
          <span
            className={`font-bold uppercase mt-1 ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            } ${taglineSizes[size]}`}
          >
            ELEKTRİKLİ MOBİLİTE PLATFORMU
          </span>
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
