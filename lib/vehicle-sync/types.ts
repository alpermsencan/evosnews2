export type VehicleVariantData = {
  name: string;
  listPrice: number;
  campaignPrice?: number | null;
  campaignAmount?: number | null;
  batteryKwh?: number | null;
  rangeKm?: number | null;
  motorPowerKw?: number | null;
  motorPowerHp?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  driveType?: string | null;
  year?: number | null;
  source: string;
  sourceUrl: string;
  externalId: string;
};

export type VehicleSyncData = {
  brand: string;
  model: string;
  year: number;
  source: string;
  sourceUrl: string;
  externalId: string;
  variants: VehicleVariantData[];
  image?: string | null;
  images?: string[];
  scrapedImages?: {
    url: string;
    type: string;
    alt: string;
    externalId: string;
  }[];
};

export type SyncResult = {
  source: string;
  status: "ok" | "error";
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  unchanged: number;
  failed: number;
  imagesFound: number;
  imagesUploaded: number;
  imagesUpdated: number;
  imagesUnchanged: number;
  imagesSkipped: number;
  imageErrors: number;
  durationMs: number;
  message?: string;
};
