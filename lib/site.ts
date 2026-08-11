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

  return "http://localhost:3000";
}

export const SITE_NAME = "Evos Gazete";
export const SITE_DESCRIPTION =
  "Elektrikli araç haberleri, şarj ağı, ÖTV rehberi, fiyat analizi ve ikinci el pazarı.";
