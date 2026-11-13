export type CampaignVerification = { verifiedAt?: string; validUntil?: string; verificationUrl?: string };

/** Financial claims are published only with dated evidence and an expiry. */
export function isCurrentCampaign(campaign: CampaignVerification, now = Date.now()) {
  if (!campaign.verifiedAt || !campaign.validUntil || !campaign.verificationUrl) return false;
  const verified = Date.parse(campaign.verifiedAt), expires = Date.parse(campaign.validUntil);
  try {
    return Number.isFinite(verified) && Number.isFinite(expires) && verified <= now && expires >= now && expires >= verified && new URL(campaign.verificationUrl).protocol === "https:";
  } catch { return false; }
}
