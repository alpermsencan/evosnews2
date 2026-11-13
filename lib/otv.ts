/** Shared display/calculation policy. Review this file when tax legislation changes. */
export const OTV_BASE_THRESHOLD = 1_650_000;
export const OTV_POWER_THRESHOLD = 160;
export const OTV_RATES = { lowPowerLowBase: 25, lowPowerHighBase: 55, highPowerLowBase: 65, highPowerHighBase: 75 } as const;

export function otvRate(base: number, motorKw: number) {
  if (motorKw <= OTV_POWER_THRESHOLD) return base <= OTV_BASE_THRESHOLD ? OTV_RATES.lowPowerLowBase : OTV_RATES.lowPowerHighBase;
  return base <= OTV_BASE_THRESHOLD ? OTV_RATES.highPowerLowBase : OTV_RATES.highPowerHighBase;
}
