/**
 * Kanonik site adresi.
 * Sitemap, RSS ve OG etiketleri mutlak URL ister; Vercel'de önizleme
 * dağıtımlarında da doğru çalışsın diye sırayla düşer.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "https://e-aracim.com";
}

export const SITE_NAME = "e-aracım";
export const SITE_DOMAIN = "e-aracim.com";
export const SITE_EMAIL = "info@e-aracim.com";
export const SITE_PHONE = "+90 540 877 77 28";
export const SITE_LOCATION = "İstanbul / Türkiye";
export const SITE_DESCRIPTION =
  "Türkiye'nin elektrikli araç platformu e-aracım: Güncel elektrikli model kataloğu, şarj ağı haritası, ikinci el elektrikli araç pazaryeri, ÖTV rehberi ve uzman analizler.";
