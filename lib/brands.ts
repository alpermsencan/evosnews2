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
  "kia": {
    "name": "Kia",
    "slug": "kia",
    "country": "Güney Kore",
    "foundedYear": 1944,
    "badgeColor": "#05141F",
    "logo": "/images/brands/kia.svg"
  },
  "hyundai": {
    "name": "Hyundai",
    "slug": "hyundai",
    "country": "Güney Kore",
    "foundedYear": 1967,
    "badgeColor": "#002C6C",
    "logo": "/images/brands/hyundai.svg"
  },
  "togg": {
    "name": "Togg",
    "slug": "togg",
    "country": "Türkiye",
    "foundedYear": 2018,
    "badgeColor": "#006699",
    "logo": "/images/brands/togg.svg"
  },
  "byd": {
    "name": "BYD",
    "slug": "byd",
    "country": "Çin",
    "foundedYear": 1995,
    "badgeColor": "#C00000",
    "logo": "/images/brands/byd.svg"
  },
  "tesla": {
    "name": "Tesla",
    "slug": "tesla",
    "country": "ABD",
    "foundedYear": 2003,
    "badgeColor": "#E82127",
    "logo": "/images/brands/tesla.svg"
  },
  "bmw": {
    "name": "BMW",
    "slug": "bmw",
    "country": "Almanya",
    "foundedYear": 1916,
    "badgeColor": "#0066B1",
    "logo": "/images/brands/bmw.svg"
  },
  "mercedes-benz": {
    "name": "Mercedes-Benz",
    "slug": "mercedes-benz",
    "country": "Almanya",
    "foundedYear": 1926,
    "badgeColor": "#000000",
    "logo": "/images/brands/mercedes.svg"
  },
  "porsche": {
    "name": "Porsche",
    "slug": "porsche",
    "country": "Almanya",
    "foundedYear": 1931,
    "badgeColor": "#9B111E",
    "logo": "/images/brands/porsche.svg"
  },
  "renault": {
    "name": "Renault",
    "slug": "renault",
    "country": "Fransa",
    "foundedYear": 1899,
    "badgeColor": "#FFCC00",
    "logo": "/images/brands/renault.svg"
  },
  "xiaomi": {
    "name": "Xiaomi",
    "slug": "xiaomi",
    "country": "Çin",
    "foundedYear": 2010,
    "badgeColor": "#FF6900",
    "logo": "/images/brands/xiaomi.svg"
  },
  "audi": {
    "name": "Audi",
    "slug": "audi",
    "country": "Almanya",
    "foundedYear": 1909,
    "badgeColor": "#BB0A30",
    "logo": "/images/brands/audi.svg"
  },
  "volkswagen": {
    "name": "Volkswagen",
    "slug": "volkswagen",
    "country": "Almanya",
    "foundedYear": 1937,
    "badgeColor": "#001E50",
    "logo": "/images/brands/volkswagen.svg"
  },
  "volvo": {
    "name": "Volvo",
    "slug": "volvo",
    "country": "İsveç",
    "foundedYear": 1927,
    "badgeColor": "#003057",
    "logo": "/images/brands/volvo.svg"
  },
  "peugeot": {
    "name": "Peugeot",
    "slug": "peugeot",
    "country": "Fransa",
    "foundedYear": 1810,
    "badgeColor": "#000000",
    "logo": "/images/brands/peugeot.svg"
  },
  "aehra": {
    "name": "AEHRA",
    "slug": "aehra",
    "country": "İtalya",
    "foundedYear": 2022,
    "badgeColor": "#1B3B36",
    "logo": ""
  },
  "aion": {
    "name": "Aion",
    "slug": "aion",
    "country": "Çin",
    "foundedYear": 2017,
    "badgeColor": "#0090FF",
    "logo": ""
  },
  "aito": {
    "name": "Aito",
    "slug": "aito",
    "country": "Çin",
    "foundedYear": 2021,
    "badgeColor": "#1E2B3E",
    "logo": ""
  },
  "aiways": {
    "name": "Aiways",
    "slug": "aiways",
    "country": "Çin",
    "foundedYear": 2017,
    "badgeColor": "#005577",
    "logo": ""
  },
  "arcfox": {
    "name": "Arcfox",
    "slug": "arcfox",
    "country": "Çin",
    "foundedYear": 2017,
    "badgeColor": "#0A0A0A",
    "logo": ""
  },
  "avatr": {
    "name": "Avatr",
    "slug": "avatr",
    "country": "Çin",
    "foundedYear": 2018,
    "badgeColor": "#2F3B43",
    "logo": ""
  },
  "baic": {
    "name": "BAIC",
    "slug": "baic",
    "country": "Çin",
    "foundedYear": 1958,
    "badgeColor": "#A61E22",
    "logo": ""
  },
  "baojun": {
    "name": "Baojun",
    "slug": "baojun",
    "country": "Çin",
    "foundedYear": 2010,
    "badgeColor": "#3B4E63",
    "logo": ""
  },
  "bollinger": {
    "name": "Bollinger",
    "slug": "bollinger",
    "country": "ABD",
    "foundedYear": 2015,
    "badgeColor": "#1A1A1A",
    "logo": ""
  },
  "buick": {
    "name": "Buick",
    "slug": "buick",
    "country": "ABD",
    "foundedYear": 1899,
    "badgeColor": "#005596",
    "logo": ""
  },
  "byton": {
    "name": "Byton",
    "slug": "byton",
    "country": "Çin",
    "foundedYear": 2016,
    "badgeColor": "#1D2327",
    "logo": ""
  },
  "cadillac": {
    "name": "Cadillac",
    "slug": "cadillac",
    "country": "ABD",
    "foundedYear": 1902,
    "badgeColor": "#000000",
    "logo": ""
  },
  "changan": {
    "name": "Changan",
    "slug": "changan",
    "country": "Çin",
    "foundedYear": 1862,
    "badgeColor": "#002F6C",
    "logo": ""
  },
  "chery": {
    "name": "Chery",
    "slug": "chery",
    "country": "Çin",
    "foundedYear": 1997,
    "badgeColor": "#A71E2B",
    "logo": ""
  },
  "chevrolet": {
    "name": "Chevrolet",
    "slug": "chevrolet",
    "country": "ABD",
    "foundedYear": 1911,
    "badgeColor": "#A28442",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/chevrolet.svg"
  },
  "citroen": {
    "name": "Citroën",
    "slug": "citroen",
    "country": "Fransa",
    "foundedYear": 1919,
    "badgeColor": "#D11919",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/citroen.svg"
  },
  "dacia": {
    "name": "Dacia",
    "slug": "dacia",
    "country": "Romanya",
    "foundedYear": 1966,
    "badgeColor": "#1D2E27",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/dacia.svg"
  },
  "denza": {
    "name": "Denza",
    "slug": "denza",
    "country": "Çin",
    "foundedYear": 2010,
    "badgeColor": "#0A4E7A",
    "logo": ""
  },
  "faraday-future": {
    "name": "Faraday Future",
    "slug": "faraday-future",
    "country": "ABD",
    "foundedYear": 2014,
    "badgeColor": "#1A1A1A",
    "logo": ""
  },
  "fiat": {
    "name": "Fiat",
    "slug": "fiat",
    "country": "İtalya",
    "foundedYear": 1899,
    "badgeColor": "#8D191D",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/fiat.svg"
  },
  "fisker": {
    "name": "Fisker",
    "slug": "fisker",
    "country": "ABD",
    "foundedYear": 2016,
    "badgeColor": "#F37021",
    "logo": ""
  },
  "ford": {
    "name": "Ford",
    "slug": "ford",
    "country": "ABD",
    "foundedYear": 1903,
    "badgeColor": "#003399",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/ford.svg"
  },
  "gmc": {
    "name": "GMC",
    "slug": "gmc",
    "country": "ABD",
    "foundedYear": 1911,
    "badgeColor": "#E41B13",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/gmc.svg"
  },
  "geely": {
    "name": "Geely",
    "slug": "geely",
    "country": "Çin",
    "foundedYear": 1986,
    "badgeColor": "#0B2240",
    "logo": ""
  },
  "genesis": {
    "name": "Genesis",
    "slug": "genesis",
    "country": "ABD",
    "foundedYear": 2015,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/genesis.svg"
  },
  "geometry": {
    "name": "Geometry",
    "slug": "geometry",
    "country": "Çin",
    "foundedYear": 2019,
    "badgeColor": "#4B9BE1",
    "logo": ""
  },
  "hiphi": {
    "name": "HiPhi",
    "slug": "hiphi",
    "country": "Çin",
    "foundedYear": 2019,
    "badgeColor": "#2A2A2A",
    "logo": ""
  },
  "honda": {
    "name": "Honda",
    "slug": "honda",
    "country": "Japonya",
    "foundedYear": 1948,
    "badgeColor": "#E4000F",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/honda.svg"
  },
  "hongqi": {
    "name": "Hongqi",
    "slug": "hongqi",
    "country": "Çin",
    "foundedYear": 1958,
    "badgeColor": "#9C1A22",
    "logo": ""
  },
  "hozon": {
    "name": "Hozon",
    "slug": "hozon",
    "country": "Çin",
    "foundedYear": 2014,
    "badgeColor": "#0A5F90",
    "logo": ""
  },
  "hycan": {
    "name": "Hycan",
    "slug": "hycan",
    "country": "Çin",
    "foundedYear": 2019,
    "badgeColor": "#2F9E82",
    "logo": ""
  },
  "im": {
    "name": "IM",
    "slug": "im",
    "country": "Çin",
    "foundedYear": 2020,
    "badgeColor": "#1B2F3D",
    "logo": ""
  },
  "indi": {
    "name": "Indi",
    "slug": "indi",
    "country": "ABD",
    "foundedYear": 2017,
    "badgeColor": "#3F51B5",
    "logo": ""
  },
  "jaguar": {
    "name": "Jaguar",
    "slug": "jaguar",
    "country": "Birleşik Krallık",
    "foundedYear": 1922,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/jaguar.svg"
  },
  "jeep": {
    "name": "Jeep",
    "slug": "jeep",
    "country": "ABD",
    "foundedYear": 1941,
    "badgeColor": "#1F3B2C",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/jeep.svg"
  },
  "kgm": {
    "name": "KGM",
    "slug": "kgm",
    "country": "Güney Kore",
    "foundedYear": 1954,
    "badgeColor": "#051A2C",
    "logo": ""
  },
  "leapmotor": {
    "name": "Leapmotor",
    "slug": "leapmotor",
    "country": "Çin",
    "foundedYear": 2015,
    "badgeColor": "#1C3C5C",
    "logo": ""
  },
  "lexus": {
    "name": "Lexus",
    "slug": "lexus",
    "country": "Japonya",
    "foundedYear": 1989,
    "badgeColor": "#0A0A0A",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/lexus.svg"
  },
  "li-auto": {
    "name": "Li Auto",
    "slug": "li-auto",
    "country": "Çin",
    "foundedYear": 2015,
    "badgeColor": "#0C5A5B",
    "logo": ""
  },
  "livan": {
    "name": "Livan",
    "slug": "livan",
    "country": "Çin",
    "foundedYear": 2022,
    "badgeColor": "#0088CC",
    "logo": ""
  },
  "lotus": {
    "name": "Lotus",
    "slug": "lotus",
    "country": "Birleşik Krallık",
    "foundedYear": 1952,
    "badgeColor": "#055C43",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/lotus.svg"
  },
  "mg": {
    "name": "MG",
    "slug": "mg",
    "country": "Çin",
    "foundedYear": 1924,
    "badgeColor": "#C00000",
    "logo": ""
  },
  "mini": {
    "name": "MINI",
    "slug": "mini",
    "country": "Birleşik Krallık",
    "foundedYear": 1959,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/mini.svg"
  },
  "mazda": {
    "name": "Mazda",
    "slug": "mazda",
    "country": "Japonya",
    "foundedYear": 1920,
    "badgeColor": "#002C5B",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/mazda.svg"
  },
  "munro": {
    "name": "Munro",
    "slug": "munro",
    "country": "Birleşik Krallık",
    "foundedYear": 2019,
    "badgeColor": "#111111",
    "logo": ""
  },
  "nio": {
    "name": "NIO",
    "slug": "nio",
    "country": "Çin",
    "foundedYear": 2014,
    "badgeColor": "#00A89F",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/nio.svg"
  },
  "nissan": {
    "name": "Nissan",
    "slug": "nissan",
    "country": "Japonya",
    "foundedYear": 1933,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/nissan.svg"
  },
  "niutron": {
    "name": "Niutron",
    "slug": "niutron",
    "country": "Çin",
    "foundedYear": 2020,
    "badgeColor": "#2C3E50",
    "logo": ""
  },
  "ora": {
    "name": "ORA",
    "slug": "ora",
    "country": "Çin",
    "foundedYear": 2018,
    "badgeColor": "#2F5F8F",
    "logo": ""
  },
  "opel": {
    "name": "Opel",
    "slug": "opel",
    "country": "Almanya",
    "foundedYear": 1862,
    "badgeColor": "#FFE600",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/opel.svg"
  },
  "polestar": {
    "name": "Polestar",
    "slug": "polestar",
    "country": "İsveç",
    "foundedYear": 1996,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/polestar.svg"
  },
  "proton": {
    "name": "Proton",
    "slug": "proton",
    "country": "Malezya",
    "foundedYear": 1983,
    "badgeColor": "#0A1F3D",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/proton.svg"
  },
  "rising-auto": {
    "name": "Rising Auto",
    "slug": "rising-auto",
    "country": "Çin",
    "foundedYear": 2020,
    "badgeColor": "#1A2E3D",
    "logo": ""
  },
  "rivian": {
    "name": "Rivian",
    "slug": "rivian",
    "country": "ABD",
    "foundedYear": 2009,
    "badgeColor": "#4A7C59",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/rivian.svg"
  },
  "roewe": {
    "name": "Roewe",
    "slug": "roewe",
    "country": "Çin",
    "foundedYear": 2006,
    "badgeColor": "#1E3B5E",
    "logo": ""
  },
  "seres": {
    "name": "SERES",
    "slug": "seres",
    "country": "Çin",
    "foundedYear": 2016,
    "badgeColor": "#0F2E4A",
    "logo": ""
  },
  "skoda": {
    "name": "Skoda",
    "slug": "skoda",
    "country": "Çek Cumhuriyeti",
    "foundedYear": 1895,
    "badgeColor": "#4BAE4F",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/skoda.svg"
  },
  "skywell": {
    "name": "Skywell",
    "slug": "skywell",
    "country": "Çin",
    "foundedYear": 2011,
    "badgeColor": "#0066AA",
    "logo": ""
  },
  "skyworth": {
    "name": "Skyworth",
    "slug": "skyworth",
    "country": "Çin",
    "foundedYear": 1988,
    "badgeColor": "#1F2E3D",
    "logo": ""
  },
  "smart": {
    "name": "Smart",
    "slug": "smart",
    "country": "Almanya",
    "foundedYear": 1994,
    "badgeColor": "#FF5A00",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/smart.svg"
  },
  "sony": {
    "name": "Sony",
    "slug": "sony",
    "country": "Japonya",
    "foundedYear": 1946,
    "badgeColor": "#000000",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/sony.svg"
  },
  "subaru": {
    "name": "Subaru",
    "slug": "subaru",
    "country": "Japonya",
    "foundedYear": 1953,
    "badgeColor": "#002F6C",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/subaru.svg"
  },
  "toyota": {
    "name": "Toyota",
    "slug": "toyota",
    "country": "Japonya",
    "foundedYear": 1937,
    "badgeColor": "#E40A12",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/toyota.svg"
  },
  "vinfast": {
    "name": "Vinfast",
    "slug": "vinfast",
    "country": "Vietnam",
    "foundedYear": 2017,
    "badgeColor": "#1B365D",
    "logo": ""
  },
  "voyah": {
    "name": "Voyah",
    "slug": "voyah",
    "country": "Çin",
    "foundedYear": 2020,
    "badgeColor": "#1A3E5E",
    "logo": ""
  },
  "weltmeister": {
    "name": "Weltmeister",
    "slug": "weltmeister",
    "country": "Çin",
    "foundedYear": 2015,
    "badgeColor": "#1F2D3D",
    "logo": ""
  },
  "xev": {
    "name": "XEV",
    "slug": "xev",
    "country": "San Marino",
    "foundedYear": 2018,
    "badgeColor": "#2F3B4C",
    "logo": ""
  },
  "xpeng": {
    "name": "Xpeng",
    "slug": "xpeng",
    "country": "Çin",
    "foundedYear": 2014,
    "badgeColor": "#E2231A",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/xpeng.svg"
  },
  "zeekr": {
    "name": "Zeekr",
    "slug": "zeekr",
    "country": "Çin",
    "foundedYear": 2021,
    "badgeColor": "#0D0E10",
    "logo": "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/zeekr.svg"
  }
};

const BRAND_ALIASES: Record<string, string> = {
  "mercedes": "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "vw": "volkswagen",
  "şgoda": "skoda",
  "škoda": "skoda"
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
