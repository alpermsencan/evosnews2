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
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939100/evos/brands/kia-logo.svg",
  },
  hyundai: {
    name: "Hyundai",
    slug: "hyundai",
    country: "Güney Kore",
    foundedYear: 1967,
    badgeColor: "#002C6C",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939101/evos/brands/hyundai-logo.svg",
  },
  togg: {
    name: "Togg",
    slug: "togg",
    country: "Türkiye",
    foundedYear: 2018,
    badgeColor: "#006699",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939102/evos/brands/togg-logo.svg",
  },
  byd: {
    name: "BYD",
    slug: "byd",
    country: "Çin",
    foundedYear: 1995,
    badgeColor: "#C00000",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939103/evos/brands/byd-logo.svg",
  },
  tesla: {
    name: "Tesla",
    slug: "tesla",
    country: "ABD",
    foundedYear: 2003,
    badgeColor: "#E82127",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939104/evos/brands/tesla-logo.svg",
  },
  bmw: {
    name: "BMW",
    slug: "bmw",
    country: "Almanya",
    foundedYear: 1916,
    badgeColor: "#0066B1",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939105/evos/brands/bmw-logo.svg",
  },
  "mercedes-benz": {
    name: "Mercedes-Benz",
    slug: "mercedes-benz",
    country: "Almanya",
    foundedYear: 1926,
    badgeColor: "#000000",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939106/evos/brands/mercedes-logo.svg",
  },
  porsche: {
    name: "Porsche",
    slug: "porsche",
    country: "Almanya",
    foundedYear: 1931,
    badgeColor: "#9B111E",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939107/evos/brands/porsche-logo.svg",
  },
  renault: {
    name: "Renault",
    slug: "renault",
    country: "Fransa",
    foundedYear: 1899,
    badgeColor: "#FFCC00",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939108/evos/brands/renault-logo.svg",
  },
  xiaomi: {
    name: "Xiaomi",
    slug: "xiaomi",
    country: "Çin",
    foundedYear: 2010,
    badgeColor: "#FF6900",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939109/evos/brands/xiaomi-logo.svg",
  },
  audi: {
    name: "Audi",
    slug: "audi",
    country: "Almanya",
    foundedYear: 1909,
    badgeColor: "#BB0A30",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939110/evos/brands/audi-logo.svg",
  },
  volkswagen: {
    name: "Volkswagen",
    slug: "volkswagen",
    country: "Almanya",
    foundedYear: 1937,
    badgeColor: "#001E50",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939111/evos/brands/vw-logo.svg",
  },
  volvo: {
    name: "Volvo",
    slug: "volvo",
    country: "İsveç",
    foundedYear: 1927,
    badgeColor: "#003057",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939112/evos/brands/volvo-logo.svg",
  },
  peugeot: {
    name: "Peugeot",
    slug: "peugeot",
    country: "Fransa",
    foundedYear: 1810,
    badgeColor: "#000000",
    logo: "https://res.cloudinary.com/y8thxjao/image/upload/v1787939113/evos/brands/peugeot-logo.svg",
  },
};

/**
 * Returns the brand configuration for a given brand name or slug.
 */
export function getBrandConfig(brandNameOrSlug: string): BrandConfig | null {
  if (!brandNameOrSlug) return null;
  const key = brandNameOrSlug.toLowerCase().trim().replace(/\s+/g, "-");
  return BRANDS[key] || BRANDS[brandNameOrSlug.toLowerCase().trim()] || null;
}
