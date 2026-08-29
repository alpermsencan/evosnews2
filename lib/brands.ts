import React from "react";

export interface BrandConfig {
  name: string;
  slug: string;
  country: string;
  foundedYear?: number;
  logo: string; // High-resolution SVG / WebP vector
  monochromeLogo?: string;
  badgeColor?: string;
}

/**
 * Central Brand Identity Catalog
 * Supports all existing and future EV brands uniformly across the platform.
 */
export const BRANDS: Record<string, BrandConfig> = {
  kia: {
    name: "Kia",
    slug: "kia",
    country: "Güney Kore",
    foundedYear: 1944,
    badgeColor: "#05141F",
    logo: "/images/brands/kia.svg",
  },
  hyundai: {
    name: "Hyundai",
    slug: "hyundai",
    country: "Güney Kore",
    foundedYear: 1967,
    badgeColor: "#002C6C",
    logo: "/images/brands/hyundai.svg",
  },
  togg: {
    name: "Togg",
    slug: "togg",
    country: "Türkiye",
    foundedYear: 2018,
    badgeColor: "#006699",
    logo: "/images/brands/togg.svg",
  },
  byd: {
    name: "BYD",
    slug: "byd",
    country: "Çin",
    foundedYear: 1995,
    badgeColor: "#C00000",
    logo: "/images/brands/byd.svg",
  },
  tesla: {
    name: "Tesla",
    slug: "tesla",
    country: "ABD",
    foundedYear: 2003,
    badgeColor: "#E82127",
    logo: "/images/brands/tesla.svg",
  },
  bmw: {
    name: "BMW",
    slug: "bmw",
    country: "Almanya",
    foundedYear: 1916,
    badgeColor: "#0066B1",
    logo: "/images/brands/bmw.svg",
  },
  "mercedes-benz": {
    name: "Mercedes-Benz",
    slug: "mercedes-benz",
    country: "Almanya",
    foundedYear: 1926,
    badgeColor: "#000000",
    logo: "/images/brands/mercedes.svg",
  },
  porsche: {
    name: "Porsche",
    slug: "porsche",
    country: "Almanya",
    foundedYear: 1931,
    badgeColor: "#9B111E",
    logo: "/images/brands/porsche.svg",
  },
  renault: {
    name: "Renault",
    slug: "renault",
    country: "Fransa",
    foundedYear: 1899,
    badgeColor: "#FFCC00",
    logo: "/images/brands/renault.svg",
  },
  xiaomi: {
    name: "Xiaomi",
    slug: "xiaomi",
    country: "Çin",
    foundedYear: 2010,
    badgeColor: "#FF6900",
    logo: "/images/brands/xiaomi.svg",
  },
  audi: {
    name: "Audi",
    slug: "audi",
    country: "Almanya",
    foundedYear: 1909,
    badgeColor: "#BB0A30",
    logo: "/images/brands/audi.svg",
  },
  volkswagen: {
    name: "Volkswagen",
    slug: "volkswagen",
    country: "Almanya",
    foundedYear: 1937,
    badgeColor: "#001E50",
    logo: "/images/brands/volkswagen.svg",
  },
  volvo: {
    name: "Volvo",
    slug: "volvo",
    country: "İsveç",
    foundedYear: 1927,
    badgeColor: "#003057",
    logo: "/images/brands/volvo.svg",
  },
  peugeot: {
    name: "Peugeot",
    slug: "peugeot",
    country: "Fransa",
    foundedYear: 1810,
    badgeColor: "#000000",
    logo: "/images/brands/peugeot.svg",
  },
};

const BRAND_ALIASES: Record<string, string> = {
  "mercedes": "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "vw": "volkswagen",
};

/**
 * Returns the brand configuration for a given brand name or slug.
 * Includes a normalization layer to resolve common variations (e.g. Mercedes -> Mercedes-Benz).
 */
export function getBrandConfig(brandNameOrSlug: string): BrandConfig | null {
  if (!brandNameOrSlug) return null;
  const rawKey = brandNameOrSlug.toLowerCase().trim();
  let key = rawKey.replace(/\s+/g, "-");
  
  // Apply aliases
  if (BRAND_ALIASES[rawKey]) {
    key = BRAND_ALIASES[rawKey];
  } else if (BRAND_ALIASES[key]) {
    key = BRAND_ALIASES[key];
  }

  return BRANDS[key] || BRANDS[rawKey] || null;
}
