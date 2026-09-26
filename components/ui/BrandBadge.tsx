"use client";

import React, { useState } from "react";
import { getBrandConfig } from "@/lib/brands";

interface BrandBadgeProps {
  brand: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export default function BrandBadge({
  brand,
  size = "md",
  showName = true,
  className = "",
}: BrandBadgeProps) {
  const config = getBrandConfig(brand);
  const displayName = config?.name || brand;
  const [logoFailed, setLogoFailed] = useState(false);

  const heightClasses = {
    sm: "h-4",
    md: "h-5",
    lg: "h-7",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Brand Icon / Vector Badge */}
      {config?.logo && !logoFailed && (
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden ${heightClasses[size]}`}
          title={displayName}
        >
          <img
            src={config.logo}
            alt={displayName}
            className="h-full w-auto object-contain"
            onError={() => setLogoFailed(true)}
          />
        </div>
      )}

      {showName && (
        <span className={`font-black uppercase tracking-wider text-neutral-900 ${
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
        }`}>
          {displayName}
        </span>
      )}
    </div>
  );
}
