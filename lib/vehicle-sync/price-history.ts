import { prisma } from "@/lib/prisma";

type HistoryInput = {
  vehicleId: string;
  variantId: string;
  listPrice: number;
  campaignPrice?: number | null;
  campaignAmount?: number | null;
  previousPrice?: number | null;
  previousCampaignPrice?: number | null;
  source: string;
  sourceUrl: string;
};

/**
 * Creates a price history entry for a vehicle variant.
 */
export async function createPriceHistory(data: HistoryInput) {
  return prisma.vehiclePriceHistory.create({
    data: {
      vehicleId: data.vehicleId,
      variantId: data.variantId,
      listPrice: data.listPrice,
      campaignPrice: data.campaignPrice ?? null,
      campaignAmount: data.campaignAmount ?? null,
      previousPrice: data.previousPrice ?? null,
      previousCampaignPrice: data.previousCampaignPrice ?? null,
      source: data.source,
      sourceUrl: data.sourceUrl,
    },
  });
}
