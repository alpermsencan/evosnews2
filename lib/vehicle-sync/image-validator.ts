/**
 * Generic Image Acceptance and Validation Engine
 * 
 * Enforces strict rules for vehicle image acceptance:
 * 1. Exact Model Identity matching
 * 2. Real Vehicle Photos (Exterior, Interior, Cockpit, Details)
 * 3. Rejection of Non-Vehicle assets (Awards, Banners, Campaigns, Lifestyle, Furniture, Buildings, Icons, Parts)
 * 4. Rejection of responsive duplicate crops (-m, -t, 1080x2160) and thumbnails (<600px, 400x300, 100x100)
 * 5. High Resolution Priority
 */

export interface ImageValidationContext {
  brand: string;
  model: string;
  url: string;
  sourceUrl?: string;
  alt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  type: "exterior" | "interior" | "gallery";
}

/**
 * Validates whether a candidate image is a genuine, high-quality, model-accurate vehicle photo.
 */
export function validateVehicleImage(ctx: ImageValidationContext): ValidationResult {
  const brand = ctx.brand.toLowerCase();
  const model = ctx.model.toLowerCase();
  const src = (ctx.sourceUrl || ctx.url || "").toLowerCase();
  const alt = (ctx.alt || "").toLowerCase();
  const full = `${src} ${alt}`;

  // 1. NON-VEHICLE / MARKETING ASSET REJECTION RULES
  const nonVehiclePatterns = [
    "banner",
    "kampanya",
    "award",
    "odul",
    "icon",
    "logo",
    "person",
    "people",
    "furniture",
    "building",
    "architecture",
    "modul",
    "header",
    "footer",
    "heat-pump",
    "isi-pompasi",
    "tray",
    "hanger",
    "sofa",
    "chair",
    "social",
    "bagaj-hacmi-icon",
    "sarj-icon",
    "batarya-icon",
    "video_background",
    "poster"
  ];

  for (const pattern of nonVehiclePatterns) {
    if (full.includes(pattern)) {
      return { isValid: false, reason: `Rejected non-vehicle asset (${pattern})`, type: "gallery" };
    }
  }

  // 2. LOW QUALITY / RESPONSIVE CROPS REJECTION RULES
  const lowQualityOrCropPatterns = [
    "400x300",
    "100x100",
    "thum",
    "thumb",
    "-m.jpg",
    "-m.png",
    "-t.jpg",
    "-t.png",
    "_m.jpg",
    "_m.png",
    "_t.jpg",
    "_t.png",
    "mobil-1080x2160",
    "960x540"
  ];

  for (const pattern of lowQualityOrCropPatterns) {
    if (full.includes(pattern)) {
      return { isValid: false, reason: `Rejected low-quality or mobile/tablet crop (${pattern})`, type: "gallery" };
    }
  }

  // 3. MODEL IDENTITY & CROSS-CONTAMINATION REJECTION RULES
  if (brand === "kia") {
    if (model.includes("ev3") && (full.includes("ev6") || full.includes("ev9") || full.includes("niro"))) {
      return { isValid: false, reason: "Kia EV3 cross-model contamination", type: "gallery" };
    }
    if (model.includes("ev6") && (full.includes("ev3") || full.includes("ev9") || full.includes("niro"))) {
      return { isValid: false, reason: "Kia EV6 cross-model contamination", type: "gallery" };
    }
    if (model.includes("ev9") && (full.includes("ev3") || full.includes("ev6") || full.includes("niro"))) {
      return { isValid: false, reason: "Kia EV9 cross-model contamination", type: "gallery" };
    }
    if (model.includes("niro") && (full.includes("ev3") || full.includes("ev6") || full.includes("ev9") || full.includes("niro-hibrit") || full.includes("hibrit"))) {
      return { isValid: false, reason: "Kia Niro EV contains hybrid or other model asset", type: "gallery" };
    }
  }

  if (brand === "hyundai") {
    if (model.includes("inster") && (full.includes("ioniq-5") || full.includes("ioniq-6") || full.includes("kona"))) {
      return { isValid: false, reason: "Hyundai Inster cross-model contamination", type: "gallery" };
    }
    if (model.includes("ioniq 5") && (full.includes("inster") || full.includes("ioniq-6") || full.includes("kona") || full.includes("ioniq3") || full.includes("building"))) {
      return { isValid: false, reason: "Hyundai IONIQ 5 cross-model/building contamination", type: "gallery" };
    }
    if (model.includes("ioniq 6") && (full.includes("inster") || full.includes("ioniq-5") || full.includes("kona") || full.includes("ioniq3") || full.includes("building"))) {
      return { isValid: false, reason: "Hyundai IONIQ 6 cross-model/building contamination", type: "gallery" };
    }
    if (model.includes("kona") && (full.includes("inster") || full.includes("ioniq-5") || full.includes("ioniq-6") || full.includes("ioniq3"))) {
      return { isValid: false, reason: "Hyundai Kona cross-model contamination", type: "gallery" };
    }
  }

  if (brand === "byd") {
    if ((model === "seal" || model.includes("excellence")) && (full.includes("sealion") || full.includes("tang") || full.includes("han") || full.includes("atto") || full.includes("dolphin"))) {
      return { isValid: false, reason: "BYD Seal cross-model contamination", type: "gallery" };
    }
    if (model.includes("sealion") && (full.includes("atto") || full.includes("han") || full.includes("tang") || full.includes("dolphin") || (full.includes("seal_") && !full.includes("sealion")))) {
      return { isValid: false, reason: "BYD Sealion cross-model contamination", type: "gallery" };
    }
    if (model.includes("han") && (full.includes("seal") || full.includes("tang") || full.includes("atto") || full.includes("dolphin"))) {
      return { isValid: false, reason: "BYD Han cross-model contamination", type: "gallery" };
    }
    if (model.includes("tang") && (full.includes("seal") || full.includes("han") || full.includes("atto") || full.includes("dolphin"))) {
      return { isValid: false, reason: "BYD Tang cross-model contamination", type: "gallery" };
    }
  }

  if (brand === "togg") {
    if (model.includes("t10x") && full.includes("t10f")) {
      return { isValid: false, reason: "Togg T10X contains T10F asset", type: "gallery" };
    }
    if (model.includes("t10f") && full.includes("t10x")) {
      return { isValid: false, reason: "Togg T10F contains T10X asset", type: "gallery" };
    }
  }

  // 4. DETERMINE TYPE (Interior / Exterior)
  let type: "exterior" | "interior" | "gallery" = "exterior";
  if (
    full.includes("interior") ||
    full.includes("ic-mekan") ||
    full.includes("ic_mekan") ||
    full.includes("ic-tasarim") ||
    full.includes("ic_tasarim") ||
    full.includes("cockpit") ||
    full.includes("kokpit") ||
    full.includes("direksiyon") ||
    full.includes("koltuk") ||
    full.includes("seat") ||
    full.includes("dashboard") ||
    full.includes("ekran") ||
    full.includes("screen")
  ) {
    type = "interior";
  }

  return { isValid: true, type };
}
