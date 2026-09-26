import { fetchText } from "@/lib/ingest/http";
import { parsePrice, slugify } from "../normalize";
import type { VehicleSyncData, VehicleVariantData } from "../types";

const KIA_PRICE_LIST_URL = "https://www.kia.com/tr/satis-merkezi/fiyat-listesi.html";

// Technical specifications lookup map for Kia electric vehicles in Turkey
const KIA_TECH_SPECS: Record<string, { batteryKwh: number; rangeKm: number }> = {
  "ev2": { batteryKwh: 58.0, rangeKm: 350 },
  "ev3": { batteryKwh: 81.4, rangeKm: 605 },
  "niro ev": { batteryKwh: 64.8, rangeKm: 460 },
  "ev6": { batteryKwh: 77.4, rangeKm: 506 },
  "ev9": { batteryKwh: 99.8, rangeKm: 505 },
};

/**
 * Scrapes high-quality images from the model-specific pages.
 */
async function scrapeKiaImages(
  model: string,
  trimUrls: string[]
): Promise<{ url: string; type: string; alt: string; externalId: string }[]> {
  const images: { url: string; type: string; alt: string; externalId: string }[] = [];
  const modelLower = model.toLowerCase();
  const cleanModelName = modelLower.replace(" ev", ""); // "niro ev" -> "niro"

  // Collect unique urls first
  const pageUrls = new Set<string>();
  for (const url of trimUrls) {
    if (url && url.startsWith("/")) {
      pageUrls.add("https://www.kia.com" + url.replace("/content/kwcms/tr/tr/", "/tr/"));
    }
  }

  // Fallback url
  if (pageUrls.size === 0) {
    pageUrls.add(`https://www.kia.com/tr/modeller/${modelLower}/ozellikler.html`);
  }

  const crypto = await import("crypto");

  for (const pageUrl of pageUrls) {
    try {
      const html = await fetchText(pageUrl);
      const regex = /\/content\/dam\/kwcms\/(?:tr\/tr|gt\/en)\/images\/showroom\/[a-zA-Z0-9_\-\/]+\.(?:jpg|jpeg|png|webp)/gi;
      const matches = html.match(regex) || [];
      const uniquePageUrls = [...new Set(matches.map((url) => "https://www.kia.com" + url))];

      for (const imgUrl of uniquePageUrls) {
        const lower = imgUrl.toLowerCase();
        
        // Ensure the image belongs to the current model (avoids other recommended cars)
        if (!lower.includes(cleanModelName)) {
          continue;
        }

        // Exclude icons, logos, buttons, color chips, and 360-viewer frame sequences
        if (
          lower.includes("icon") ||
          lower.includes("logo") ||
          lower.includes("chip") ||
          lower.includes("color") ||
          lower.includes("btn") ||
          lower.includes("pictogram") ||
          lower.includes("thumb") ||
          lower.includes("360") ||
          /[-_]\d{3,4}\.(png|jpg|jpeg|webp)$/i.test(lower)
        ) {
          continue; // skip
        }

        const hash = crypto.createHash("sha1").update(imgUrl).digest("hex");
        const externalId = `kia-img-${hash}`;

        // Determine simple type
        const type =
          lower.includes("int") ||
          lower.includes("kab") ||
          lower.includes("konsol") ||
          lower.includes("display")
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
      console.warn(`[SYNC][KIA][IMAGE] Failed to parse model page ${pageUrl}:`, err);
    }
  }

  return images;
}

/**
 * Fetches and parses electric vehicle prices and images from the official Kia Turkey website.
 */
export async function fetchKiaPrices(): Promise<VehicleSyncData[]> {
  const html = await fetchText(KIA_PRICE_LIST_URL);

  const regex = /var\s+item\s*=\s*\{([\s\S]*?)\};/g;
  let match;
  const rawItems: Record<string, string>[] = [];

  while ((match = regex.exec(html)) !== null) {
    const block = match[1];
    const item: Record<string, string> = {};
    const pairs = block.matchAll(/['"]([^'"]+)['"]\s*:\s*["']([^"']*)["']/g);
    for (const p of pairs) {
      item[p[1]] = p[2].trim();
    }

    const isElectric = item.fuelName === "Elektrikli" || item.fuelDisplayName === "Elektrikli";
    const isCurrentYear = item.tabYear === "2026";

    if (isElectric && isCurrentYear && item.modelDisplayName) {
      rawItems.push(item);
    }
  }

  if (rawItems.length === 0) {
    throw new Error("No electric vehicle variants parsed from Kia price list HTML. Parser might be broken or source format changed.");
  }

  // Group raw items by model
  const grouped: Record<string, { variants: VehicleVariantData[]; urls: string[]; thumbnails: string[] }> = {};

  for (const raw of rawItems) {
    const model = raw.modelDisplayName;
    const modelLower = model.toLowerCase();
    const trim = raw.trimDisplayName || "Standart";

    // Validate trim name
    if (!trim || trim.trim() === "") {
      console.warn(`[SYNC][KIA] Skipping variant with invalid trim name: ${model}`);
      continue;
    }

    const kw = raw.moterPower ? parseFloat(raw.moterPower.replace(",", ".")) : null;
    const hp = kw ? Math.round(kw * 1.36) : null;

    const listPrice = parsePrice(raw.turnkeyPrice) ?? 0;
    const campPrice = parsePrice(raw.campaignPrice);
    const discount = parsePrice(raw.discountCampaign);

    // Validate listPrice
    if (listPrice <= 0) {
      console.warn(`[SYNC][KIA] Skipping variant with invalid listPrice: ${model} ${trim} (${listPrice})`);
      continue;
    }

    const hasCampaign = campPrice != null && campPrice > 0 && campPrice < listPrice;

    const specs = KIA_TECH_SPECS[modelLower] || { batteryKwh: null, rangeKm: null };

    const externalId = `kia-${slugify(model)}-${slugify(trim)}`;

    const variant: VehicleVariantData = {
      name: trim,
      listPrice,
      campaignPrice: hasCampaign ? campPrice : null,
      campaignAmount: hasCampaign ? (discount ?? (listPrice - campPrice)) : null,
      batteryKwh: specs.batteryKwh,
      rangeKm: specs.rangeKm,
      motorPowerKw: kw ? Math.round(kw) : null,
      motorPowerHp: hp,
      source: "kia-official",
      sourceUrl: KIA_PRICE_LIST_URL,
      externalId,
    };

    if (!grouped[model]) {
      grouped[model] = { variants: [], urls: [], thumbnails: [] };
    }
    
    // Ensure no duplicates inside the same model
    if (!grouped[model].variants.some(v => v.externalId === externalId)) {
      grouped[model].variants.push(variant);
    }
    if (raw.url) grouped[model].urls.push(raw.url);
    if (raw.thumbnail) grouped[model].thumbnails.push(raw.thumbnail);
  }

  const syncData: VehicleSyncData[] = [];
  for (const [model, data] of Object.entries(grouped)) {
    if (data.variants.length > 0) {
      // 1. Scrape all images for this model
      const scraped = await scrapeKiaImages(model, data.urls);

      // 2. Add the primary price list thumbnail as the first (primary) image
      const primaryThumb = data.thumbnails.find(Boolean);
      if (primaryThumb) {
        const primaryUrl = "https://www.kia.com" + primaryThumb;
        const primaryExtId = `kia-img-${slugify(model)}-primary`;
        
        // Remove from scraped list if it was already scraped to avoid duplicates
        const cleanScraped = scraped.filter(img => img.url !== primaryUrl && img.externalId !== primaryExtId);
        
        // Prepend primary
        cleanScraped.unshift({
          url: primaryUrl,
          type: "gallery",
          alt: `${model} Resmi Görseli`,
          externalId: primaryExtId,
        });

        syncData.push({
          brand: "Kia",
          model,
          year: 2026,
          source: "kia-official",
          sourceUrl: KIA_PRICE_LIST_URL,
          externalId: `kia-${slugify(model)}`,
          variants: data.variants,
          scrapedImages: cleanScraped,
        });
      } else {
        syncData.push({
          brand: "Kia",
          model,
          year: 2026,
          source: "kia-official",
          sourceUrl: KIA_PRICE_LIST_URL,
          externalId: `kia-${slugify(model)}`,
          variants: data.variants,
          scrapedImages: scraped,
        });
      }
    }
  }

  if (syncData.length === 0) {
    throw new Error("No valid electric vehicle variants matched specs and validations from Kia price list HTML.");
  }

  return syncData;
}
