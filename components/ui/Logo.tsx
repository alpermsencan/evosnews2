import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "compact" | "horizontal" | "icon-only" | "footer";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({
  variant = "default",
  size = "md",
  showTagline = true,
  className = "",
  href = "/",
}: LogoProps) {
  // Boyut ölçeklendirmeleri
  const emblemSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-12 h-12 sm:w-14 sm:h-14",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  const taglineSizes = {
    sm: "text-[8px] tracking-[0.2em]",
    md: "text-[9px] tracking-[0.24em]",
    lg: "text-[10px] tracking-[0.28em]",
  };

  const emblem = (
    <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]} group`}>
      {/* Arka plan yumuşak neon elektrik halesi (ambient glow) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-blue-600/25 to-teal-400/20 blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Vektörel Amblem */}
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_2px_10px_rgba(0,240,255,0.35)] transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Ana Amblem Gövde Gradyanı (Koyu Safir & Titanyum Derinlik) */}
          <linearGradient id="evoBase" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0E1E38" />
            <stop offset="50%" stopColor="#081022" />
            <stop offset="100%" stopColor="#040711" />
          </linearGradient>

          {/* Dış Çerçeve Çelik & Neon Işıma Gradyanı */}
          <linearGradient id="evoBorder" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="30%" stopColor="#00F0FF" />
            <stop offset="70%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Dinamik Elektrik Kanadı (EV & İleri Vektör) */}
          <linearGradient id="evoElectric" x1="6" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Autopilot HUD Vektörü Gradyanı */}
          <linearGradient id="evoVolt" x1="20" y1="6" x2="38" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* İç Işık Parıltısı (Specular Highlight) */}
          <linearGradient id="evoSpecular" x1="12" y1="4" x2="32" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Dış Aerodinamik Gövde (Modern Fasetli Kalkan) */}
        <path
          d="M22 2.5L38.5 8.5V23.5C38.5 32.2 31.4 39.4 22 42.5C12.6 39.4 5.5 32.2 5.5 23.5V8.5L22 2.5Z"
          fill="url(#evoBase)"
          stroke="url(#evoBorder)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* 2. İç Faset Yansıma Çizgisi */}
        <path
          d="M22 4.5L36.5 9.8V23C36.5 30.8 30.2 37.3 22 40.2C13.8 37.3 7.5 30.8 7.5 23V9.8L22 4.5Z"
          stroke="url(#evoSpecular)"
          strokeWidth="0.8"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* 3. Sol & Üst Kanat: "E" ve İleri Enerji Akışı */}
        <path
          d="M13 13.5H29.5C31.2 13.5 32.2 14.8 31.5 16.3L27.5 24.5C27 25.5 25.8 26.2 24.6 26.2H14.5C13.4 26.2 12.8 25.2 13.2 24.2L16.2 16.8C16.5 16 16.2 15.2 15.5 14.8L13 13.5Z"
          fill="url(#evoElectric)"
        />

        {/* 4. Sağ & Alt Kanat: "V" & Autopilot HUD Dinamiği */}
        <path
          d="M31 16L22.5 33.5C21.9 34.7 20.1 34.7 19.5 33.5L14 22.5C13.5 21.5 14.3 20.2 15.5 20.2H23L27 12C27.5 11 29 11.2 29.5 12.2L31 16Z"
          fill="url(#evoVolt)"
          opacity="0.95"
        />

        {/* 5. Merkez Fütüristik Yıldırım/Vurgu Çentiği (Pure White Core) */}
        <path
          d="M23.5 10L17.5 22H24.5L20 32.5L30.5 19.5H24L26.5 10H23.5Z"
          fill="#FFFFFF"
          className="drop-shadow-[0_0_6px_#00F0FF]"
        />

        {/* 6. Mikro Enerji Pulu / Radar Noktası */}
        <circle cx="22" cy="7" r="1.2" fill="#00F0FF" />
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
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {emblem}

      <div className="flex flex-col leading-none select-none">
        {/* Ana Tipografi */}
        <div className={`flex items-baseline font-black tracking-tight ${titleSizes[size]}`}>
          {/* EVO */}
          <span className="text-white tracking-normal drop-shadow-sm font-black">
            EVO
          </span>

          {/* to */}
          <span className="text-cyan-400 font-extrabold italic mx-[1px] text-[0.88em]">
            to
          </span>

          {/* Pilot */}
          <span className="text-white font-black tracking-normal">
            Pilot
          </span>

          {/* Üst Mikro Puls Noktası */}
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1 mb-2 animate-pulse shadow-[0_0_8px_#00F0FF]" />
        </div>

        {/* Alt Açıklama / Premium Tagline */}
        {showTagline && variant !== "compact" && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`font-black uppercase text-cyan-300/80 ${taglineSizes[size]}`}
            >
              ELEKTRİKLİ MOBİLİTE PLATFORMU
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
