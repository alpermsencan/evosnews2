import "server-only";
import { prisma } from "./prisma";
import { calculateVoltScore, type VoltScoreResult } from "./voltscore";
import { assessBattery } from "./battery-report";

/**
 * İLAN SERVİS KATMANI
 *
 * VoltScore ve batarya değerlendirmesi tek bir yerden yazılır. Bunu her yazma
 * ucuna dağıtmak, bir ucun güncellemeyi unutması demekti — puanın ilanla
 * tutarsız kalması, sistemin güvenilirliğini bitirirdi.
 */

/** İlan listelerinde ve kartlarda ihtiyaç duyulan alanlar. */
export const listingCardSelect = {
  id: true,
  title: true,
  slug: true,
  brand: true,
  model: true,
  year: true,
  km: true,
  price: true,
  city: true,
  image: true,
  condition: true,
  sellerType: true,
  sellerName: true,
  damage: true,
  rangeKm: true,
  batteryHealth: true,
  isSponsored: true,
  voltScore: true,
  createdAt: true,
} as const;

/**
 * İlanın VoltScore'unu yeniden hesaplar ve kaydeder.
 *
 * Batarya sağlığı için ÖNCE doğrulanmış rapor kullanılır; rapor yoksa satıcının
 * beyan ettiği `batteryHealth` alanına düşülür. İkisi arasındaki fark önemlidir
 * ve arayüzde belirtilir: ölçülmüş değer ile beyan aynı ağırlıkta değildir.
 */
export async function recalcVoltScore(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      batteryReport: true,
      vehicle: { select: { rangeKm: true } },
    },
  });
  if (!listing) return null;

  // Yalnızca DOĞRULANMIŞ rapor puana girer — doğrulanmamış ölçüm, satıcının
  // kendi beyanından daha güvenilir değildir.
  const verified = listing.batteryReport?.verifiedAt ? listing.batteryReport : null;

  const result = calculateVoltScore({
    sohPercent: verified?.sohPercent ?? listing.batteryHealth ?? null,
    km: listing.km,
    year: listing.year,
    fastChargeHabit: listing.fastChargeHabit,
    warrantyMonthsLeft: listing.warrantyMonthsLeft,
    serviceHistory: listing.serviceHistory,
    damage: listing.damage,
    realRangeKm: listing.realRangeKm,
    catalogRangeKm: listing.vehicle?.rangeKm ?? listing.rangeKm,
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      voltScore: result.score,
      voltScoreAt: new Date(),
      voltScoreBreakdown: result as unknown as object,
    },
  });

  return result;
}

/** Kaydedilmiş kırılımı okur; yoksa anlık hesaplar. */
export function readBreakdown(raw: unknown): VoltScoreResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as VoltScoreResult;
  return Array.isArray(r.criteria) ? r : null;
}

/**
 * Batarya raporunu ölçüm değerlerinden değerlendirir ve kaydeder.
 * Kalan ömür ve risk ASLA girdiden alınmaz; burada hesaplanır.
 */
export async function upsertBatteryReport(
  listingId: string,
  input: {
    sohPercent: number;
    cycleCount?: number | null;
    fastChargeRatio?: number | null;
    odometerKm?: number | null;
    measuredBy: string;
    measuredAt: Date;
  },
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { year: true },
  });
  if (!listing) throw new Error("İlan bulunamadı");

  const assessment = assessBattery({
    sohPercent: input.sohPercent,
    cycleCount: input.cycleCount,
    fastChargeRatio: input.fastChargeRatio,
    odometerKm: input.odometerKm,
    vehicleYear: listing.year,
  });

  const data = {
    ...input,
    estimatedYearsLeft: assessment.estimatedYearsLeft,
    riskLevel: assessment.riskLevel,
  };

  const report = await prisma.batteryReport.upsert({
    where: { listingId },
    // Ölçüm değiştiğinde doğrulama DÜŞER: yeni ölçüm yeniden onaylanmalıdır.
    update: { ...data, verifiedAt: null, verifiedBy: null },
    create: { listingId, ...data },
  });

  await recalcVoltScore(listingId);
  return { report, assessment };
}

/** Raporu doğrular; rozet ancak bundan sonra görünür ve puan tazelenir. */
export async function verifyBatteryReport(listingId: string, verifiedBy: string) {
  const report = await prisma.batteryReport.update({
    where: { listingId },
    data: { verifiedAt: new Date(), verifiedBy },
  });
  await recalcVoltScore(listingId);
  return report;
}
