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
  className = "",
  href = "/",
}: LogoProps) {
  const isDark = theme ? theme === "dark" : variant === "footer";

  // Sadece ikon istendiğinde (örnek: küçük favicon veya amblem alanları)
  if (variant === "icon-only") {
    const emblemSizes = {
      sm: "w-8 h-8",
      md: "w-10 h-10 sm:w-11 sm:h-11",
      lg: "w-12 h-12 sm:w-14 sm:h-14",
      xl: "w-16 h-16 sm:w-20 sm:h-20",
    };

    const emblem = (
      <div className={`relative shrink-0 flex items-center justify-center rounded-full ${emblemSizes[size]} group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] ${className}`}>
        <Image
          src="/images/logo-emblem-badge.png"
          alt="e-aracim.com Logo"
          width={160}
          height={160}
          priority
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    );

    return href ? (
      <Link href={href} aria-label="e-aracim.com Anasayfa" className="inline-flex">
        {emblem}
      </Link>
    ) : (
      emblem
    );
  }

  // Varsayılan Logo: Kullanıcının tam olarak istediği orijinal logo görseli!
  // Logo boyutları (Header, Footer, Mobil, vb. için hassas yükseklik ayarı)
  const heightClasses = {
    sm: "h-8 sm:h-9",
    md: "h-10 sm:h-11",
    lg: "h-12 sm:h-14",
    xl: "h-16 sm:h-20",
  };

  const logoElement = (
    <div
      className={`relative inline-flex items-center ${heightClasses[size]} aspect-[2.67/1] select-none group transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      <Image
        src={isDark ? "/images/site-logo-transparent.png" : "/images/site-logo-light.png"}
        alt="e-aracim.com ELEKTRİKLİ ARAÇ REHBERİ"
        width={950}
        height={355}
        priority
        className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,180,216,0.25)]"
      />
    </div>
  );

  return href ? (
    <Link href={href} aria-label="e-aracim.com Anasayfa" className="inline-flex items-center focus:outline-none">
      {logoElement}
    </Link>
  ) : (
    logoElement
  );
}
