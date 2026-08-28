import { fetchText } from "@/lib/ingest/http";
import { parsePrice, slugify } from "../normalize";
import type { VehicleSyncData, VehicleVariantData } from "../types";

const TOGG_PRICE_LIST_URL = "https://www.togg.com.tr/price-list";
const TOGG_T10F_PRICE_LIST_URL = "https://www.togg.com.tr/t10f-price-list";

const TOGG_T10X_PAGE_URL = "https://www.togg.com.tr/t10x";
const TOGG_T10F_PAGE_URL = "https://www.togg.com.tr/t10f";

// Technical specifications lookup map for Togg electric vehicles in Turkey
const TOGG_TECH_SPECS: Record<
  string,
  { batteryKwh: number; rangeKm: number; motorPowerKw: number; motorPowerHp: number }
> = {
  // T10X
  "togg-t10x-v1-rwd-standart-menzil": { batteryKwh: 52.4, rangeKm: 314, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10x-v1-rwd-uzun-menzil": { batteryKwh: 88.5, rangeKm: 523, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10x-v2-rwd-uzun-menzil": { batteryKwh: 88.5, rangeKm: 523, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10x-v2-4more-obsidiyen": { batteryKwh: 88.5, rangeKm: 468, motorPowerKw: 320, motorPowerHp: 435 },
  "togg-t10x-v2-4more": { batteryKwh: 88.5, rangeKm: 468, motorPowerKw: 320, motorPowerHp: 435 },

  // T10F
  "togg-t10f-v1-rwd-standart-menzil": { batteryKwh: 52.4, rangeKm: 350, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10f-v1-rwd-uzun-menzil": { batteryKwh: 88.5, rangeKm: 600, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10f-v2-rwd-uzun-menzil": { batteryKwh: 88.5, rangeKm: 600, motorPowerKw: 160, motorPowerHp: 218 },
  "togg-t10f-v2-4more": { batteryKwh: 88.5, rangeKm: 530, motorPowerKw: 320, motorPowerHp: 435 },
};

/**
 * Scrapes high-quality images from the official Togg model pages.
 */
async function scrapeToggImages(
  model: string,
  pageUrl: string,
  primaryUrl?: string
): Promise<{ url: string; type: string; alt: string; externalId: string }[]> {
  const images: { url: string; type: string; alt: string; externalId: string }[] = [];
  const crypto = await import("crypto");

  if (primaryUrl) {
    const hash = crypto.createHash("sha1").update(primaryUrl).digest("hex");
    images.push({
      url: primaryUrl,
      type: "exterior",
      alt: `${model} Resmi Ana Görseli`,
      externalId: `togg-img-${hash}`,
    });
  }

  try {
    const html = await fetchText(pageUrl);
    const regex = /["\x27](\/assets\/img\/[a-zA-Z0-9_\-]+\.(?:webp|jpg|jpeg|png))["\x27]/gi;
    const matches = [...html.matchAll(regex)].map((m) => m[1]);
    const uniqueUrls = [...new Set(matches.map((u) => "https://www.togg.com.tr" + u))];

    for (const imgUrl of uniqueUrls) {
      if (imgUrl === primaryUrl) continue;
      const lower = imgUrl.toLowerCase();

      // Filter out icons, logos, favicons, placeholders, ui buttons, small assets
      if (
        lower.includes("favicon") ||
        lower.includes("logo") ||
        lower.includes("icon") ||
        lower.includes("placeholder") ||
        lower.includes("btn") ||
        lower.includes("banner") ||
        lower.includes("badge") ||
        lower.includes("32.png") ||
        lower.includes("256px.png") ||
        lower.includes("-en.") ||
        lower.includes("-tr.") ||
        lower.includes("_en.webp") ||
        lower.includes("_tr.webp") ||
        lower.includes("/en.webp") ||
        lower.includes("/tr.webp") ||
        lower.includes("euro-ncap") ||
        lower.includes("video-pause") ||
        lower.includes("video-play") ||
        lower.includes("speaker")
      ) {
        continue;
      }

      const hash = crypto.createHash("sha1").update(imgUrl).digest("hex");
      const externalId = `togg-img-${hash}`;

      const type =
        lower.includes("int") ||
        lower.includes("kab") ||
        lower.includes("kokpit") ||
        lower.includes("display") ||
        lower.includes("konsol") ||
        lower.includes("interior") ||
        lower.includes("trunk")
          ? "interior"
          : "exterior";

      images.push({
        url: imgUrl,
        type,
        alt: `${model} Resmi ${type === "interior" ? "İç Mekan" : "Dış Mekan"} Görseli`,
        externalId,
      });
    }
  } catch (err) {
    console.warn(`[SYNC][TOGG][IMAGE] Failed to parse model page ${pageUrl}:`, err);
  }

  return images;
}

/**
 * Parses variants and prices from a Togg price list HTML page.
 */
function parsePriceListPage(
  html: string,
  modelName: string,
  sourceUrl: string
): VehicleVariantData[] {
  // Isolate the main versions table from options table
  const mainSection = html.split(/Opsiyonlar/i)[0] || html;

  // Match version items (e.g. V1 RWD Standart Menzil, V2 RWD Uzun Menzil, etc.)
  const vMatches = [
    ...mainSection.matchAll(
      /class="[^"]*(?:version-content|list-section-table-item)[^"]*"[^>]*>\s*([Vv]\d[^<]+)<\/div>/gi
    ),
  ];
  const versions = vMatches.map((m) => m[1].trim());

  // Match price items (e.g. 1.909.048 ₺)
  const pMatches = [
    ...mainSection.matchAll(
      /class="[^"]*(?:version-content|list-section-table-item)[^"]*"[^>]*>\s*([0-9\.\,]+(?:\s*₺|\s*TL)?)\s*<\/div>/gi
    ),
  ];
  const prices = pMatches
    .map((m) => parsePrice(m[1]))
    .filter((p): p is number => p !== null && p > 500000);

  if (versions.length === 0 || prices.length === 0) {
    console.warn(`[SYNC][TOGG] No versions/prices found in ${sourceUrl}`);
    return [];
  }

  const variants: VehicleVariantData[] = [];
  const count = Math.min(versions.length, prices.length);

  for (let i = 0; i < count; i++) {
    const trim = versions[i];
    const listPrice = prices[i];
    const externalId = `togg-${slugify(modelName)}-${slugify(trim)}`;

    const specs = TOGG_TECH_SPECS[externalId] || {
      batteryKwh: null,
      rangeKm: null,
      motorPowerKw: null,
      motorPowerHp: null,
    };

    variants.push({
      name: trim,
      listPrice,
      campaignPrice: null,
      campaignAmount: null,
      batteryKwh: specs.batteryKwh,
      rangeKm: specs.rangeKm,
      motorPowerKw: specs.motorPowerKw,
      motorPowerHp: specs.motorPowerHp,
      source: "togg-official",
      sourceUrl,
      externalId,
    });
  }

  return variants;
}

/**
 * Fetches and parses electric vehicle prices, variants, specs, and images
 * from official Togg Turkey website.
 */
export async function fetchToggPrices(): Promise<VehicleSyncData[]> {
  const syncData: VehicleSyncData[] = [];

  // 1. Togg T10X
  try {
    const t10xHtml = await fetchText(TOGG_PRICE_LIST_URL);
    const t10xVariants = parsePriceListPage(t10xHtml, "T10X", TOGG_PRICE_LIST_URL);

    if (t10xVariants.length > 0) {
      const t10xPrimaryUrl =
        "https://www.togg.com.tr/assets/img/67262b77e4312d0ac71e6d6d_Price-List-Hero-Image.webp";
      const t10xImages = await scrapeToggImages("T10X", TOGG_T10X_PAGE_URL, t10xPrimaryUrl);

      syncData.push({
        brand: "Togg",
        model: "T10X",
        year: 2026,
        source: "togg-official",
        sourceUrl: TOGG_PRICE_LIST_URL,
        externalId: "togg-t10x",
        variants: t10xVariants,
        scrapedImages: t10xImages,
      });
    }
  } catch (err) {
    console.error("[SYNC][TOGG] Failed to sync T10X:", err);
  }

  // 2. Togg T10F
  try {
    const t10fHtml = await fetchText(TOGG_T10F_PRICE_LIST_URL);
    const t10fVariants = parsePriceListPage(t10fHtml, "T10F", TOGG_T10F_PRICE_LIST_URL);

    if (t10fVariants.length > 0) {
      const t10fPrimaryUrl =
        "https://www.togg.com.tr/assets/img/68beb224450a990a0823985f_T10F-smart-connected.webp";
      const t10fImages = await scrapeToggImages("T10F", TOGG_T10F_PAGE_URL, t10fPrimaryUrl);

      syncData.push({
        brand: "Togg",
        model: "T10F",
        year: 2026,
        source: "togg-official",
        sourceUrl: TOGG_T10F_PRICE_LIST_URL,
        externalId: "togg-t10f",
        variants: t10fVariants,
        scrapedImages: t10fImages,
      });
    }
  } catch (err) {
    console.error("[SYNC][TOGG] Failed to sync T10F:", err);
  }

  if (syncData.length === 0) {
    throw new Error(
      "No valid electric vehicle variants matched specs and validations from Togg official sources."
    );
  }

  return syncData;
}
