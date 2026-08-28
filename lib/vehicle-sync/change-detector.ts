type PriceState = {
  listPrice: number;
  campaignPrice?: number | null;
  campaignAmount?: number | null;
};

/**
 * Returns true if the prices between existing and incoming states differ.
 * This checks:
 * 1. List price changes
 * 2. Campaign price changes (including adding a new campaign or removing an existing one)
 */
export function hasPriceChanged(current: PriceState, incoming: PriceState): boolean {
  if (current.listPrice !== incoming.listPrice) {
    return true;
  }

  const currentCampaign = current.campaignPrice ?? null;
  const incomingCampaign = incoming.campaignPrice ?? null;

  return currentCampaign !== incomingCampaign;
}
