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
  tagline = "TÜRKİYE'NİN ELEKTRİKLİ ARAÇ MERKEZİ",
  className = "",
  href = "/",
}: LogoProps) {
  // Tema belirleme: footer için varsayılan dark, diğerleri için varsayılan light
  const isDark = theme ? theme === "dark" : variant === "footer";

  // Boyut ölçeklendirmeleri
  const emblemSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9 sm:w-10 sm:h-10",
    lg: "w-11 h-11 sm:w-12 sm:h-12",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-[22px]",
    lg: "text-2xl sm:text-[28px]",
  };

  const taglineSizes = {
    sm: "text-[7.5px] tracking-[0.18em]",
    md: "text-[8.5px] sm:text-[9px] tracking-[0.22em]",
    lg: "text-[10px] tracking-[0.24em]",
  };

  // Kurumsal, dinamik ve göze çarpan otomotiv amblemi (Hız kanalları + Supersonic Autopilot Vektörü)
  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]}`}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="emblemBg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <linearGradient id="emblemVector" x1="24" y1="10" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D2D3" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="specularGlint" x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Dış Gövde: Lüks Otomotiv Faseti */}
        <rect
          x="1.5"
          y="1.5"
          width="41"
          height="41"
          rx="12"
          fill="url(#emblemBg)"
          stroke={isDark ? "#334155" : "#1E293B"}
          strokeWidth="1.5"
        />

        {/* 2. Üst Işık Yansıma Çizgisi */}
        <rect
          x="2.5"
          y="2.5"
          width="39"
          height="18"
          rx="10"
          stroke="url(#specularGlint)"
          strokeWidth="1"
          fill="none"
        />

        {/* 3. Aerodinamik 'E' Hız Kanatları (Parlak Beyaz) */}
        <path
          d="M12 13.5H23C24.4 13.5 25.2 14.8 24.5 16.1L23.8 17.5H12V13.5Z"
          fill="#FFFFFF"
        />
        <path
          d="M12 20H21C22.4 20 23.2 21.3 22.5 22.6L21.8 24H12V20Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <path
          d="M12 26.5H23C24.4 26.5 25.2 27.8 24.5 29.1L23.8 30.5H12V26.5Z"
          fill="#FFFFFF"
        />

        {/* 4. Supersonic Autopilot Yön Vektörü (Elektrik Mavisi & Turkuaz) */}
        <path
          d="M25 12L34 22L25 32H29.5L37 22L29.5 12H25Z"
          fill="url(#emblemVector)"
        />

        {/* 5. Hassas Merkez Enerji Çekirdeği */}
        <circle cx="21" cy="22" r="1.5" fill="#00D2D3" />
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

        {/* Alt Kurumsal Slogan / Tagline */}
        {showTagline && variant !== "compact" && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`inline-flex items-center px-1 py-0.5 rounded text-[7.5px] font-black tracking-wider leading-none ${
                isDark
                  ? "bg-sky-950/80 border border-sky-500/40 text-sky-300"
                  : "bg-sky-50 border border-sky-200/80 text-sky-700"
              }`}
            >
              TR
            </span>
            <span
              className={`font-extrabold uppercase ${
                isDark ? "text-neutral-400" : "text-neutral-600"
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
