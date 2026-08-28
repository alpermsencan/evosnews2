import { fetchText } from "@/lib/ingest/http";
import { parsePrice, slugify } from "../normalize";
import type { VehicleSyncData, VehicleVariantData } from "../types";

const BYD_PRICE_LIST_URL = "https://www.bydauto.com.tr/fiyat-listesi";

// Model page URLs mapping
const BYD_MODEL_PAGE_MAP: Record<string, string> = {
  seal: "https://www.bydauto.com.tr/seal",
  sealion7: "https://www.bydauto.com.tr/sealion7",
  "sealion-7": "https://www.bydauto.com.tr/sealion7",
  han: "https://www.bydauto.com.tr/han",
  tang: "https://www.bydauto.com.tr/tang",
  atto3: "https://www.bydauto.com.tr/atto3",
  "atto-3": "https://www.bydauto.com.tr/atto3",
  dolphin: "https://www.bydauto.com.tr/dolphin",
  "sealu-ev": "https://www.bydauto.com.tr/sealu-ev",
  "seal-u-ev": "https://www.bydauto.com.tr/sealu-ev",
  atto2: "https://www.bydauto.com.tr/atto2",
  "atto-2": "https://www.bydauto.com.tr/atto2",
};

// Technical specs lookup map for BYD BEV vehicles in Turkey
const BYD_TECH_SPECS: Record<
  string,
  { batteryKwh: number; rangeKm: number; motorPowerKw: number; motorPowerHp: number; driveType: string }
> = {
  // BYD SEAL
  "byd-seal-excellence": { batteryKwh: 82.5, rangeKm: 520, motorPowerKw: 390, motorPowerHp: 530, driveType: "AWD" },
  "byd-seal-excellence-390-kw-awd": { batteryKwh: 82.5, rangeKm: 520, motorPowerKw: 390, motorPowerHp: 530, driveType: "AWD" },
  "byd-seal-design": { batteryKwh: 82.5, rangeKm: 570, motorPowerKw: 230, motorPowerHp: 313, driveType: "RWD" },

  // BYD SEALION 7
  "byd-sealion-7-excellence": { batteryKwh: 91.3, rangeKm: 502, motorPowerKw: 390, motorPowerHp: 530, driveType: "AWD" },
  "byd-sealion-7-excellence-390-kw-awd": { batteryKwh: 91.3, rangeKm: 502, motorPowerKw: 390, motorPowerHp: 530, driveType: "AWD" },
  "byd-sealion-7-comfort": { batteryKwh: 82.5, rangeKm: 482, motorPowerKw: 230, motorPowerHp: 313, driveType: "RWD" },

  // BYD HAN
  "byd-han-executive": { batteryKwh: 85.4, rangeKm: 521, motorPowerKw: 380, motorPowerHp: 517, driveType: "AWD" },
  "byd-han-executive-380-kw-awd": { batteryKwh: 85.4, rangeKm: 521, motorPowerKw: 380, motorPowerHp: 517, driveType: "AWD" },

  // BYD TANG
  "byd-tang-flagship": { batteryKwh: 108.8, rangeKm: 530, motorPowerKw: 380, motorPowerHp: 517, driveType: "AWD" },
  "byd-tang-flagship-380-kw-awd": { batteryKwh: 108.8, rangeKm: 530, motorPowerKw: 380, motorPowerHp: 517, driveType: "AWD" },

  // BYD ATTO 3
  "byd-atto-3-design": { batteryKwh: 60.48, rangeKm: 420, motorPowerKw: 150, motorPowerHp: 204, driveType: "FWD" },

  // BYD DOLPHIN
  "byd-dolphin-design": { batteryKwh: 60.48, rangeKm: 427, motorPowerKw: 150, motorPowerHp: 204, driveType: "FWD" },

  // BYD SEAL U EV
  "byd-seal-u-ev-design": { batteryKwh: 71.8, rangeKm: 500, motorPowerKw: 160, motorPowerHp: 218, driveType: "FWD" },

  // BYD ATTO 2
  "byd-atto-2-comfort": { batteryKwh: 45.12, rangeKm: 312, motorPowerKw: 130, motorPowerHp: 177, driveType: "FWD" },
};

/**
 * Scrapes high-quality images from the official BYD model pages.
 */
async function scrapeBydImages(
  modelKey: string,
  pageUrl: string
): Promise<{ url: string; type: string; alt: string; externalId: string }[]> {
  const images: { url: string; type: string; alt: string; externalId: string }[] = [];
  const crypto = await import("crypto");

  try {
    const html = await fetchText(pageUrl);
    const regex = /https:\/\/bydauto\.mncdn\.com\/[^\s\"\'\)]+\.(?:jpg|jpeg|png|webp)/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = [...new Set(matches)];

    for (const imgUrl of uniqueUrls) {
      const lower = imgUrl.toLowerCase();

      // Filter out icons, logos, favicons, placeholders, ui buttons, thumbnails, small assets
      if (
        lower.includes("favicon") ||
        lower.includes("logo") ||
        lower.includes("icon") ||
        lower.includes("placeholder") ||
        lower.includes("thumb") ||
        lower.includes("model-menu") ||
        lower.includes("blindlook") ||
        lower.includes("svg") ||
        lower.includes("social") ||
        lower.includes("btn") ||
        lower.includes("footer")
      ) {
        continue;
      }

      const hash = crypto.createHash("sha1").update(imgUrl).digest("hex");
      const isInterior =
        lower.includes("ic-mekan") ||
        lower.includes("interior") ||
        lower.includes("kokpit") ||
        lower.includes("direksiyon") ||
        lower.includes("koltuk") ||
        lower.includes("ekran");

      images.push({
        url: imgUrl,
        type: isInterior ? "interior" : "exterior",
        alt: `BYD ${modelKey.toUpperCase()} Resmi Görseli`,
        externalId: `byd-img-${hash}`,
      });
    }
  } catch (err) {
    console.error(`[SYNC][BYD][IMAGE] Failed to scrape images from ${pageUrl}:`, err);
  }

  return images;
}

/**
 * Extracts base model name from full model string.
 * e.g. "BYD SEAL 390 kW AWD" -> "SEAL"
 * e.g. "BYD SEALION 7 390kW AWD" -> "SEALION 7"
 * e.g. "BYD HAN 380 kW AWD" -> "HAN"
 * e.g. "BYD TANG 380 kW AWD" -> "TANG"
 */
function extractBaseModel(rawModel: string): string {
  let cleaned = rawModel.replace(/^BYD\s+/i, "").trim();
  // Remove motor/drive spec from model name if attached
  cleaned = cleaned.replace(/\s+\d+\s*kW.*$/i, "").trim();
  return cleaned || rawModel;
}

/**
 * Fetches and parses all 100% BEV electric vehicle prices, variants, specs, and images from BYD Turkey.
 */
export async function fetchBydPrices(): Promise<VehicleSyncData[]> {
  const html = await fetchText(BYD_PRICE_LIST_URL);
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const tables = html.match(tableRegex) || [];

  const vehicleMap = new Map<string, VehicleSyncData>();

  for (const tableHtml of tables) {
    const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
    const rows = tableHtml.match(rowRegex) || [];

    for (const row of rows) {
      if (row.includes("<th")) continue; // Skip header row

      const modelMatch =
        row.match(/data-label="Model"[^>]*>([\s\S]*?)<\/td>/i) ||
        row.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
      const trimMatch = row.match(/data-label="Donanım"[^>]*>([\s\S]*?)<\/td>/i);
      const otvMatch = row.match(/data-label="ÖTV Oranı"[^>]*>([\s\S]*?)<\/td>/i);
      const listPriceMatch = row.match(/data-label="Tavsiye Edilen Liste Fiyatı"[^>]*>([\s\S]*?)<\/td>/i);
      const campPriceMatch = row.match(/data-label="Kampanyalı Fiyatı"[^>]*>([\s\S]*?)<\/td>/i);

      const rawModel = modelMatch ? modelMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const trim = trimMatch ? trimMatch[1].replace(/<[^>]+>/g, "").trim() : "Standart";
      const otvText = otvMatch ? otvMatch[1].replace(/<[^>]+>/g, "").trim() : "%75";
      const rawListPrice = listPriceMatch ? listPriceMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const rawCampPrice = campPriceMatch ? campPriceMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      if (!rawModel || !rawListPrice) continue;

      // HYBRID / DM-i FILTER: Do NOT include hybrid or plug-in hybrid models
      const lowerModel = rawModel.toLowerCase();
      if (
        lowerModel.includes("dm-i") ||
        lowerModel.includes("dmi") ||
        lowerModel.includes("hybrid") ||
        lowerModel.includes("hibrit") ||
        lowerModel.includes("plug-in")
      ) {
        console.log(`[SYNC][BYD][SKIP_HYBRID] Ignored hybrid vehicle: ${rawModel}`);
        continue;
      }

      const listPrice = parsePrice(rawListPrice);
      if (!listPrice || listPrice <= 0) continue;

      const campaignPrice = rawCampPrice ? parsePrice(rawCampPrice) : null;
      const baseModel = extractBaseModel(rawModel);
      const baseModelSlug = slugify(baseModel);

      const variantKey = slugify(`byd-${baseModel}-${trim}`);
      const detailedVariantKey = slugify(`byd-${rawModel}-${trim}`);
      const specs = BYD_TECH_SPECS[detailedVariantKey] || BYD_TECH_SPECS[variantKey] || null;

      // Clean variant name e.g. "Excellence 390 kW AWD" or "Executive"
      const motorSpecMatch = rawModel.match(/\d+\s*kW(?:\s+AWD|\s+RWD|\s+FWD)?/i);
      const motorSpec = motorSpecMatch ? motorSpecMatch[0].trim() : "";
      const variantName = motorSpec ? `${trim} ${motorSpec}` : trim;

      const variant: VehicleVariantData = {
        name: variantName,
        externalId: `byd-${baseModelSlug}-${slugify(variantName)}`,
        year: 2026,
        fuelType: "ELECTRIC",
        transmission: "Otomatik",
        driveType: specs?.driveType || (rawModel.toUpperCase().includes("AWD") ? "AWD" : "RWD"),
        batteryKwh: specs?.batteryKwh || null,
        rangeKm: specs?.rangeKm || null,
        motorPowerKw: specs?.motorPowerKw || (motorSpecMatch ? parseInt(motorSpecMatch[0], 10) : null),
        motorPowerHp: specs?.motorPowerHp || null,
        listPrice,
        campaignPrice: campaignPrice && campaignPrice > 0 ? campaignPrice : null,
        source: "byd-official",
        sourceUrl: BYD_PRICE_LIST_URL,
      };

      const vehicleKey = `byd-${baseModelSlug}`;
      if (!vehicleMap.has(vehicleKey)) {
        vehicleMap.set(vehicleKey, {
          brand: "BYD",
          model: baseModel,
          year: 2026,
          source: "byd-official",
          sourceUrl: BYD_PRICE_LIST_URL,
          externalId: vehicleKey,
          variants: [variant],
        });
      } else {
        const existing = vehicleMap.get(vehicleKey)!;
        if (!existing.variants.some((v) => v.externalId === variant.externalId)) {
          existing.variants.push(variant);
        }
      }
    }
  }

  const result: VehicleSyncData[] = Array.from(vehicleMap.values());

  // Scrape images for each detected BEV model
  for (const vehicle of result) {
    const slug = slugify(vehicle.model);
    const modelPageUrl = BYD_MODEL_PAGE_MAP[slug] || `https://www.bydauto.com.tr/${slug}`;
    console.log(`[SYNC][BYD] Scraping images for ${vehicle.brand} ${vehicle.model} from ${modelPageUrl}...`);
    const scrapedImages = await scrapeBydImages(vehicle.model, modelPageUrl);
    vehicle.scrapedImages = scrapedImages;
    console.log(`[SYNC][BYD] Found ${scrapedImages.length} images for ${vehicle.brand} ${vehicle.model}`);
  }

  return result;
}
