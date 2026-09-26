import type { VehicleSyncData, VehicleVariantData } from "../types";

const TESLA_TR_URL = "https://www.tesla.com/tr_tr";
const TESLA_INVENTORY_API_URL = "https://www.tesla.com/inventory/api/v1/inventory-results";

/**
 * Validates and retrieves high-resolution official images from Tesla's digital assets CDN.
 */
export async function scrapeTeslaImages(
  modelKey: "modely" | "model3"
): Promise<{ url: string; type: string; alt: string; externalId: string }[]> {
  const images: { url: string; type: string; alt: string; externalId: string }[] = [];
  const crypto = await import("crypto");

  const candidateImages =
    modelKey === "modely"
      ? [
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-Y-Main-Hero-Desktop-Global.jpg",
            type: "exterior",
            alt: "Tesla Model Y Resmi Ana Görsel",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global",
            type: "exterior",
            alt: "Tesla Model Y Ultra HD Dış Görsel",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-Y-Desktop-Global.png",
            type: "exterior",
            alt: "Tesla Model Y Dış Tasarım",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-Y-Interior-Hero-Desktop-LHD.jpg",
            type: "interior",
            alt: "Tesla Model Y İç Mekan",
          },
        ]
      : [
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg",
            type: "exterior",
            alt: "Tesla Model 3 Resmi Ana Görsel",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-3-Main-Hero-Desktop-LHD",
            type: "exterior",
            alt: "Tesla Model 3 Ultra HD Dış Görsel",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-3-Desktop-LHD.png",
            type: "exterior",
            alt: "Tesla Model 3 Dış Tasarım",
          },
          {
            url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Interior-Hero-Desktop-LHD.jpg",
            type: "interior",
            alt: "Tesla Model 3 İç Mekan",
          },
        ];

  for (const item of candidateImages) {
    try {
      const res = await fetch(item.url, { method: "HEAD" });
      if (res.ok && (res.headers.get("content-type")?.startsWith("image/") || res.status === 200)) {
        const hash = crypto.createHash("sha1").update(item.url).digest("hex");
        images.push({
          url: item.url,
          type: item.type,
          alt: item.alt,
          externalId: `tesla-img-${hash}`,
        });
      }
    } catch (err) {
      console.warn(`[SYNC][TESLA][IMAGE] Failed to verify ${item.url}:`, err);
    }
  }

  return images;
}

/**
 * Attempts to fetch official prices, variants, and specs from Tesla Turkey.
 * If blocked by Akamai Bot Manager (HTTP 403), preserves existing DB prices,
 * does NOT invent fake prices, and returns official vehicle structures with verified CDN images.
 */
export async function fetchTeslaPrices(): Promise<VehicleSyncData[]> {
  const query = JSON.stringify({
    query: {
      model: "my",
      condition: "new",
      options: {},
      arrangeby: "Price",
      order: "asc",
      market: "TR",
      language: "tr",
    },
    offset: 0,
    count: 20,
  });

  const apiUrl = `${TESLA_INVENTORY_API_URL}?query=${encodeURIComponent(query)}`;

  let priceApiBlocked = false;
  let rawResults: any[] = [];

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "tr-TR,tr;q=0.9",
        Referer: "https://www.tesla.com/tr_tr/inventory/new/my",
      },
    });

    if (res.status === 403) {
      console.warn("[SYNC][TESLA] Tesla price API blocked by Akamai WAF (HTTP 403). Preserving DB prices.");
      priceApiBlocked = true;
    } else if (res.ok) {
      const data = await res.json();
      rawResults = data?.results || [];
    } else {
      console.warn(`[SYNC][TESLA] Tesla price API returned HTTP ${res.status}.`);
      priceApiBlocked = true;
    }
  } catch (err) {
    console.warn(`[SYNC][TESLA] Connection error to Tesla price API:`, err);
    priceApiBlocked = true;
  }

  // If live pricing is returned from Tesla, parse it dynamically
  if (!priceApiBlocked && rawResults.length > 0) {
    const vehicleMap = new Map<string, VehicleSyncData>();

    for (const item of rawResults) {
      const rawModel = item.Model || item.model || "Model Y";
      const trim = item.TrimName || item.trim || "Long Range";
      const listPrice = item.PurchasePrice || item.TotalPrice || item.Price;
      if (!listPrice || listPrice <= 0) continue;

      const baseModel = rawModel.startsWith("Model") ? rawModel : `Model ${rawModel}`;
      const variantName = trim;
      const externalId = `tesla-${baseModel.toLowerCase().replace(/\s+/g, "")}-${variantName.toLowerCase().replace(/\s+/g, "-")}`;

      const variant: VehicleVariantData = {
        name: variantName,
        externalId,
        year: item.Year || 2026,
        fuelType: "ELECTRIC",
        transmission: "Otomatik",
        driveType: trim.includes("AWD") ? "AWD" : "RWD",
        batteryKwh: item.BatteryCapacity || null,
        rangeKm: item.Range || null,
        motorPowerKw: null,
        motorPowerHp: null,
        listPrice,
        campaignPrice: null,
        source: "tesla-official",
        sourceUrl: TESLA_TR_URL,
      };

      const vehicleKey = `tesla-${baseModel.toLowerCase().replace(/\s+/g, "-")}`;
      if (!vehicleMap.has(vehicleKey)) {
        vehicleMap.set(vehicleKey, {
          brand: "Tesla",
          model: baseModel,
          year: item.Year || 2026,
          source: "tesla-official",
          sourceUrl: TESLA_TR_URL,
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

    const syncData = Array.from(vehicleMap.values());
    for (const v of syncData) {
      if (v.model.toLowerCase().includes("3")) {
        v.scrapedImages = await scrapeTeslaImages("model3");
      } else {
        v.scrapedImages = await scrapeTeslaImages("modely");
      }
    }

    return syncData;
  }

  // When price API is blocked by Akamai WAF:
  // Return official Model Y vehicle data with verified CDN images and EMPTY variants
  // so NO fake prices are created, and existing DB prices remain completely intact.
  const modelYImages = await scrapeTeslaImages("modely");
  const model3Images = await scrapeTeslaImages("model3");

  return [
    {
      brand: "Tesla",
      model: "Model Y",
      year: 2026,
      source: "tesla-official",
      sourceUrl: TESLA_TR_URL,
      externalId: "tesla-model-y",
      variants: [],
      scrapedImages: modelYImages,
    },
    {
      brand: "Tesla",
      model: "Model 3",
      year: 2026,
      source: "tesla-official",
      sourceUrl: TESLA_TR_URL,
      externalId: "tesla-model-3",
      variants: [],
      scrapedImages: model3Images,
    },
  ];
}
