import { fetchText } from "@/lib/ingest/http";
import { slugify } from "../normalize";
import { validateVehicleImage } from "../image-validator";
import type { VehicleSyncData, VehicleVariantData } from "../types";

const HYUNDAI_PRICE_LIST_URL = "https://www.hyundai.com/tr/tr/satis/fiyat-listesi.html";
const HYUNDAI_GQL_URL = "https://org-eu-www.hyundai.com/eu/papi";

const HYUNDAI_TECH_SPECS: Record<string, { batteryKwh: number; rangeKm: number }> = {
  "inster-71.1": { batteryKwh: 42.0, rangeKm: 300 },
  "inster-84.5": { batteryKwh: 49.0, rangeKm: 355 },
  "kona-99": { batteryKwh: 48.4, rangeKm: 377 },
  "ioniq 5-125": { batteryKwh: 58.0, rangeKm: 384 },
  "ioniq 5-160": { batteryKwh: 84.0, rangeKm: 570 },
  "ioniq 5 n-448": { batteryKwh: 84.0, rangeKm: 448 },
  "ioniq 6-125": { batteryKwh: 53.0, rangeKm: 429 },
  "ioniq 6-160": { batteryKwh: 77.4, rangeKm: 614 },
  "ioniq 9-160": { batteryKwh: 110.3, rangeKm: 620 },
  "ioniq 9-226": { batteryKwh: 110.3, rangeKm: 550 },
};

function getModelPath(modelName: string): string {
  const name = modelName.toLowerCase();
  if (name.includes("inster")) return "/tr/tr/modeller/inster.html";
  if (name.includes("kona")) return "/tr/tr/modeller/kona-elektrik.html";
  if (name.includes("ioniq 5 n")) return "/tr/tr/modeller/ioniq5-n.html";
  if (name.includes("ioniq 5")) return "/tr/tr/modeller/ioniq5.html";
  if (name.includes("ioniq 6")) return "/tr/tr/modeller/ioniq-6.html";
  if (name.includes("ioniq 9")) return "/tr/tr/modeller/ioniq-9.html";
  return `/tr/tr/modeller/${slugify(modelName)}.html`;
}

/**
 * Scrapes high-quality images from the model-specific pages of Hyundai.
 */
async function scrapeHyundaiImages(
  model: string
): Promise<{ url: string; type: string; alt: string; externalId: string }[]> {
  const images: { url: string; type: string; alt: string; externalId: string }[] = [];
  const modelLower = model.toLowerCase();
  const keyword = modelLower.includes("inster")
    ? "inster"
    : modelLower.includes("kona")
    ? "kona"
    : "ioniq";

  const pagePath = getModelPath(model);
  const pageUrl = "https://www.hyundai.com" + pagePath;

  const crypto = await import("crypto");

  try {
    const html = await fetchText(pageUrl);
    const regex = /https:\/\/dmassets\.hyundai\.com\/is\/image\/hyundaiautoever\/[^"'\? ]+/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = [...new Set(matches)];

    for (const imgUrl of uniqueUrls) {
      const lower = imgUrl.toLowerCase();

      // Ensure it is related to our current model
      if (!lower.includes(keyword)) {
        continue;
      }

      // Exclude logos, icons, lazy loading placeholders
      if (
        lower.includes("logo") ||
        lower.includes("icon") ||
        lower.includes("lazy")
      ) {
        continue;
      }

      // Strip aspect ratio suffix if any to get the high quality original (e.g. :4x3, :16x9)
      let cleanUrl = imgUrl.replace(/(&quot;|&#34;|"|'|}|;|,|\\|&lt;|&gt;).*$/, "");
      const lastColon = cleanUrl.lastIndexOf(":");
      if (lastColon > 5) {
        cleanUrl = cleanUrl.substring(0, lastColon);
      }

      if (!cleanUrl.startsWith("https://dmassets.hyundai.com/")) {
        continue;
      }

      // Use generic image validation engine
      const validation = validateVehicleImage({
        brand: "Hyundai",
        model,
        url: cleanUrl,
        sourceUrl: pageUrl,
        alt: `${model} Resmi Görseli`,
      });

      if (!validation.isValid) {
        continue; // skip rejected non-vehicle / duplicate / building / award
      }

      const hash = crypto.createHash("sha1").update(cleanUrl).digest("hex");
      const externalId = `hyundai-img-${hash}`;

      if (images.some((img) => img.externalId === externalId)) {
        continue;
      }

      images.push({
        url: cleanUrl,
        type: validation.type,
        alt: `${model} Resmi ${validation.type === "interior" ? "İç Mekan" : "Dış Mekan"} Görseli`,
        externalId,
      });
    }
  } catch (err) {
    console.warn(`[SYNC][HYUNDAI][IMAGE] Failed to parse model page ${pageUrl}:`, err);
  }

  return images;
}

/**
 * Fetches and parses electric vehicle prices and images from the official Hyundai Turkey website.
 */
export async function fetchHyundaiPrices(): Promise<VehicleSyncData[]> {
  const html = await fetchText(HYUNDAI_PRICE_LIST_URL);

  // Discover all ModelPriceTable components and their model names
  const headerRegex = /<span class="accordion__btn-inner">([^<]+)<\/span>[\s\S]*?data-app-name="ModelPriceTable"[^>]*>\s*(\{[\s\S]*?\})\s*<\/script>/gi;
  let match;
  const discoveredModels: { name: string; modelId: string }[] = [];

  while ((match = headerRegex.exec(html)) !== null) {
    const name = match[1].trim();
    const nameLower = name.toLowerCase();

    // Sadece elektrikli modelleri alıyoruz (Hibritler eleniyor)
    const isElectric =
      (nameLower.includes("elektrik") ||
        nameLower.includes("ioniq") ||
        nameLower.includes("inster")) &&
      !nameLower.includes("hibrit") &&
      !nameLower.includes("hybrid");

    if (isElectric) {
      try {
        const config = JSON.parse(match[2]);
        discoveredModels.push({ name, modelId: config.modelId });
      } catch (e) {
        console.error(`[SYNC][HYUNDAI] JSON parsing failed for model ${name}:`, e);
      }
    }
  }

  if (discoveredModels.length === 0) {
    throw new Error("No electric vehicle models found on Hyundai price list page.");
  }

  const syncData: VehicleSyncData[] = [];

  // GraphQL query body template
  const query = `
    query HppPriceListTR(
      $service: TrimmedString!
      $country: TrimmedString!
      $modelId: TrimmedString!
    ) {
      hppPriceListTR(
        service: $service,
        country: $country,
        modelId: $modelId
      ) {
        plant
        productYear
        modelDescription
        powertrainNm
        trimNm
        fuelTypeNm
        transmissionType
        maxPrice
        maxcampaignPrice
      }
    }
  `;

  for (const modelInfo of discoveredModels) {
    // Clean model name (e.g. "Yeni IONIQ 6" -> "IONIQ 6")
    let model = modelInfo.name
      .replace("Yeni ", "")
      .replace(" - Yerli Üretim", "")
      .trim();

    try {
      const response = await fetch(HYUNDAI_GQL_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          query,
          variables: {
            country: "tr",
            service: "S03",
            modelId: modelInfo.modelId,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[SYNC][HYUNDAI] GQL HTTP error for ${model}: ${response.status}`);
        continue;
      }

      const resJson = await response.json();
      const rawVariants = resJson?.data?.hppPriceListTR || [];

      const variants: VehicleVariantData[] = [];

      for (const raw of rawVariants) {
        // Sadece elektrik olanları koru
        if (raw.fuelTypeNm !== "Elektrik") {
          continue;
        }

        const trim = raw.trimNm || "Standart";
        const listPrice = Number(raw.maxPrice) || 0;
        const campaignPrice = Number(raw.maxcampaignPrice) || null;

        // Fiyat validasyonu
        if (listPrice <= 0) {
          continue;
        }

        const hasCampaign = campaignPrice != null && campaignPrice > 0 && campaignPrice < listPrice;

        // Power (kW / HP) parsing from powertrainNm (e.g. "125 kW" or "160kW (218PS)")
        let kw: number | null = null;
        if (raw.powertrainNm) {
          const matchKw = raw.powertrainNm.match(/(\d+[\.,]?\d*)\s*kW/i);
          if (matchKw) {
            kw = parseFloat(matchKw[1].replace(",", "."));
          }
        }
        const hp = kw ? Math.round(kw * 1.36) : null;

        // Battery / Range lookup key construction
        const modelLower = model.toLowerCase();
        const kwKey = kw ? `-${Math.round(kw)}` : "";
        const lookupKey = `${modelLower}${kwKey}`;
        const specs = HYUNDAI_TECH_SPECS[lookupKey] || HYUNDAI_TECH_SPECS[modelLower] || { batteryKwh: null, rangeKm: null };

        const externalId = `hyundai-${slugify(model)}-${slugify(trim)}`;

        variants.push({
          name: trim,
          listPrice,
          campaignPrice: hasCampaign ? campaignPrice : null,
          campaignAmount: hasCampaign ? (listPrice - campaignPrice!) : null,
          batteryKwh: specs.batteryKwh,
          rangeKm: specs.rangeKm,
          motorPowerKw: kw ? Math.round(kw) : null,
          motorPowerHp: hp,
          source: "hyundai-official",
          sourceUrl: HYUNDAI_PRICE_LIST_URL,
          externalId,
        });
      }

      if (variants.length > 0) {
        // Scrape model images
        const scrapedImages = await scrapeHyundaiImages(model);

        syncData.push({
          brand: "Hyundai",
          model,
          year: rawVariants[0]?.productYear || 2026,
          source: "hyundai-official",
          sourceUrl: HYUNDAI_PRICE_LIST_URL,
          externalId: `hyundai-${slugify(model)}`,
          variants,
          scrapedImages,
        });
      }
    } catch (err) {
      console.error(`[SYNC][HYUNDAI][ERROR] Failed to fetch prices for model ${model}:`, err);
    }
  }

  if (syncData.length === 0) {
    throw new Error("No valid Hyundai electric vehicle variants found after scraping and validations.");
  }

  return syncData;
}
