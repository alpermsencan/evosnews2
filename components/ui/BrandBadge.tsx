"use client";

import React from "react";
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

  const sizeClasses = {
    sm: "h-4 text-xs gap-1.5",
    md: "h-5 text-sm gap-2",
    lg: "h-7 text-base gap-2.5",
  };

  const logoSizes = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-7 h-7 text-sm",
  };

  return (
    <div className={`inline-flex items-center font-black tracking-tight ${sizeClasses[size]} ${className}`}>
      {/* Brand Icon / Vector Badge */}
      <div
        className={`flex shrink-0 items-center justify-center rounded bg-neutral-900 font-black text-white ${logoSizes[size]}`}
        style={{
          backgroundColor: config?.badgeColor || "#171717",
        }}
        title={displayName}
      >
        {displayName.slice(0, 2).toUpperCase()}
      </div>

      {showName && (
        <span className="font-black uppercase tracking-wider text-neutral-900">
          {displayName}
        </span>
      )}
    </div>
  );
}
