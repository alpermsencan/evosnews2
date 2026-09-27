import React from "react";
import Link from "next/link";
import BrandBadge from "@/components/ui/BrandBadge";

export default function ModernVehicleHeader({
  brand,
  model,
  slug,
}: {
  brand: string;
  model: string;
  slug: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumb Nav */}
      <nav className="flex items-center gap-2 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition">
          ANASAYFA
        </Link>
        <span>›</span>
        <Link href="/araclar" className="hover:text-neutral-900 transition">
          ELEKTRİKLİ ARAÇLAR
        </Link>
        <span>›</span>
        <Link
          href={`/araclar?brand=${encodeURIComponent(brand)}`}
          className="hover:text-neutral-900 transition uppercase"
        >
          {brand}
        </Link>
        <span>›</span>
        <span className="text-neutral-700 font-extrabold truncate">{model}</span>
      </nav>

      {/* Brand & Model Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <BrandBadge brand={brand} size="lg" />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
              {brand}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 tracking-tight">
              {brand} {model}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
