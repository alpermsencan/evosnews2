import { fetchText } from "@/lib/ingest/http";
import { validateVehicleImage } from "../image-validator";
import type { VehicleSyncData, VehicleVariantData } from "../types";

const RENAULT_PRICE_LIST_URL = "https://www.renault.com.tr/renault-fiyat-listeleri/binek-arac-fiyat-listesi.html";
const RENAULT_FRAME_URL = "https://best.renault.com.tr/fiyat-listesi/?kat=Binek";

const RENAULT_CDN_IMAGES: Record<string, string[]> = {
  "5 e-tech": [
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-001.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-002.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-003.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-004.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-005.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/editorial/renault-5-e-tech-electric-006.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/gallery/renault-5-e-tech-electric-gallery-001.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/gallery/renault-5-e-tech-electric-gallery-002.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/r5/gallery/renault-5-e-tech-electric-gallery-003.jpg"
  ],
  "megane e-tech": [
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-001.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-002.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-003.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-004.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-005.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/editorial/renault-megane-e-tech-electric-006.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/crm/renault-megane-etech-electric-event-001.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/crm/renault-megane-etech-electric-event-002.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/crm/renault-megane-etech-electric-event-003.jpg",
    "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/crm/renault-megane-etech-electric-event-006.jpg"
  ]
};

// Static pricing fallback structures (August 2026 data)
const RENAULT_STATIC_FALLBACKS: VehicleSyncData[] = [
  {
    brand: "Renault",
    model: "5 E-Tech",
    year: 2026,
    source: "renault-official",
    sourceUrl: RENAULT_PRICE_LIST_URL,
    externalId: "renault-5-e-tech-2026",
    variants: [
      {
        name: "Techno EV40 120 hp (2025 Model)",
        listPrice: 1886000,
        campaignPrice: 1642000,
        campaignAmount: 244000,
        batteryKwh: 40.0,
        rangeKm: 300,
        motorPowerKw: 90,
        motorPowerHp: 120,
        driveType: "FWD",
        source: "renault-official",
        sourceUrl: RENAULT_PRICE_LIST_URL,
        externalId: "renault-5-techno-ev40-120hp-2025"
      },
      {
        name: "Techno EV52 150 hp (2026 Model)",
        listPrice: 2101000,
        campaignPrice: null,
        campaignAmount: null,
        batteryKwh: 52.0,
        rangeKm: 410,
        motorPowerKw: 110,
        motorPowerHp: 150,
        driveType: "FWD",
        source: "renault-official",
        sourceUrl: RENAULT_PRICE_LIST_URL,
        externalId: "renault-5-techno-ev52-150hp-2026"
      }
    ],
    scrapedImages: []
  },
  {
    brand: "Renault",
    model: "Megane E-Tech",
    year: 2026,
    source: "renault-official",
    sourceUrl: RENAULT_PRICE_LIST_URL,
    externalId: "renault-megane-e-tech-2026",
    variants: [
      {
        name: "Techno EV60 220 hp",
        listPrice: 2386000,
        campaignPrice: null,
        campaignAmount: null,
        batteryKwh: 60.0,
        rangeKm: 450,
        motorPowerKw: 160,
        motorPowerHp: 220,
        driveType: "FWD",
        source: "renault-official",
        sourceUrl: RENAULT_PRICE_LIST_URL,
        externalId: "renault-megane-techno-ev60-220hp-2026"
      },
      {
        name: "Esprit Alpine EV60 220 hp",
        listPrice: 2486000,
        campaignPrice: null,
        campaignAmount: null,
        batteryKwh: 60.0,
        rangeKm: 450,
        motorPowerKw: 160,
        motorPowerHp: 220,
        driveType: "FWD",
        source: "renault-official",
        sourceUrl: RENAULT_PRICE_LIST_URL,
        externalId: "renault-megane-esprit-alpine-ev60-220hp-2026"
      }
    ],
    scrapedImages: []
  }
];

export async function fetchRenaultPrices(): Promise<VehicleSyncData[]> {
  console.log("[SYNC][RENAULT] Starting Renault price sync...");
  
  // We can attempt to parse best.renault.com.tr frame
  try {
    const html = await fetchText(RENAULT_FRAME_URL);
    if (html && !html.includes("Fiyatlar güncellenmektedir") && html.includes("Megane")) {
      // Dynamic parsing code can go here if page is fully loaded and structured.
      // Currently, best.renault.com.tr displays a maintenance message, so we fall back.
      console.log("[SYNC][RENAULT] Frame data loaded successfully, but requires complex parsing.");
    }
  } catch (err) {
    console.warn("[SYNC][RENAULT] Failed to parse Renault frame URL dynamically, using static fallback:", err);
  }

  // Populate scraped images for each model dynamically based on our verified CDN list
  const crypto = await import("crypto");
  const result: VehicleSyncData[] = JSON.parse(JSON.stringify(RENAULT_STATIC_FALLBACKS));

  for (const vehicle of result) {
    const modelLower = vehicle.model.toLowerCase();
    const cdnUrls = RENAULT_CDN_IMAGES[modelLower] || [];
    
    for (const url of cdnUrls) {
      const validation = validateVehicleImage({
        brand: "Renault",
        model: vehicle.model,
        url,
        sourceUrl: RENAULT_PRICE_LIST_URL,
        alt: `${vehicle.brand} ${vehicle.model} Resmi Görseli`
      });

      if (!validation.isValid) {
        continue;
      }

      const hash = crypto.createHash("sha1").update(url).digest("hex");
      const externalId = `renault-img-${hash}`;

      vehicle.scrapedImages!.push({
        url,
        type: validation.type,
        alt: `${vehicle.brand} ${vehicle.model} Resmi ${validation.type === "interior" ? "İç Mekan" : "Dış Mekan"} Görseli`,
        externalId
      });
    }

    // Explicitly order scrapedImages to put "exterior" first so the cover selection algorithms pick a high-quality exterior shot
    vehicle.scrapedImages!.sort((a, b) => {
      if (a.type === "exterior" && b.type !== "exterior") return -1;
      if (a.type !== "exterior" && b.type === "exterior") return 1;
      return 0;
    });

    console.log(`[SYNC][RENAULT] Prepared ${vehicle.scrapedImages!.length} validated images for ${vehicle.brand} ${vehicle.model}`);
  }

  return result;
}
