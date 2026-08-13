import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/compare?vehicle=slug1,slug2&listing=slug3
 *
 * Karşılaştırma sepeti tarayıcıda (localStorage) tutulur; sunucu sepeti
 * bilmez. Bu uç, sepetteki slug'lara karşılık gelen kayıtları ORTAK bir
 * biçimde döndürür — sıfır katalog aracı ile ikinci el ilan aynı tabloda
 * yan yana gelebilsin diye alan adları tek şemaya indirgenir.
 */

const MAX = 4;

export type CompareRow = {
  kind: "vehicle" | "listing";
  slug: string;
  title: string;
  href: string;
  image: string;
  price: number;
  year: number | null;
  km: number | null;
  condition: string;
  rangeKm: number | null;
  rangeSummerKm: number | null;
  rangeWinterKm: number | null;
  batteryKwh: number | null;
  dcChargeKw: number | null;
  motorPowerHp: number | null;
  acceleration: number | null;
  consumption: number | null;
  segment: string | null;
  city: string | null;
  batteryHealth: number | null;
  batteryVerified: boolean;
  voltScore: number | null;
};

const split = (raw: string | null) =>
  (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const vehicleSlugs = split(sp.get("vehicle"));
  const listingSlugs = split(sp.get("listing"));

  return handle(async () => {
    const [vehicles, listings] = await Promise.all([
      vehicleSlugs.length
        ? prisma.vehicle.findMany({ where: { slug: { in: vehicleSlugs } } })
        : [],
      listingSlugs.length
        ? prisma.listing.findMany({
            where: { slug: { in: listingSlugs }, status: "PUBLISHED" },
            include: {
              batteryReport: { select: { verifiedAt: true, sohPercent: true } },
              vehicle: true,
            },
          })
        : [],
    ]);

    const rows: CompareRow[] = [
      ...vehicles.map<CompareRow>((v) => ({
        kind: "vehicle",
        slug: v.slug,
        title: `${v.brand} ${v.model}`,
        href: `/araclar/${v.slug}`,
        image: v.image,
        price: v.price,
        year: v.year,
        km: 0,
        condition: "SIFIR",
        rangeKm: v.rangeKm,
        rangeSummerKm: v.rangeSummerKm,
        rangeWinterKm: v.rangeWinterKm,
        batteryKwh: v.batteryKwh,
        dcChargeKw: v.dcChargeKw,
        motorPowerHp: v.motorPowerHp,
        acceleration: v.acceleration,
        consumption: v.consumption,
        segment: v.segment,
        city: null,
        // Sıfır araçta batarya %100'dür; ölçüm gerektirmez.
        batteryHealth: 100,
        batteryVerified: false,
        voltScore: null,
      })),
      ...listings.map<CompareRow>((l) => ({
        kind: "listing",
        slug: l.slug,
        title: l.title,
        href: `/ilanlar/${l.slug}`,
        image: l.image,
        price: l.price,
        year: l.year,
        km: l.km,
        condition: l.condition,
        // Teknik veri katalogdan gelir; ilanda tekrar girilmesi gerekmez.
        rangeKm: l.vehicle?.rangeKm ?? (l.rangeKm || null),
        rangeSummerKm: l.vehicle?.rangeSummerKm ?? null,
        rangeWinterKm: l.vehicle?.rangeWinterKm ?? null,
        batteryKwh: l.vehicle?.batteryKwh ?? null,
        dcChargeKw: l.vehicle?.dcChargeKw ?? null,
        motorPowerHp: l.vehicle?.motorPowerHp ?? null,
        acceleration: l.vehicle?.acceleration ?? null,
        consumption: l.vehicle?.consumption ?? null,
        segment: l.vehicle?.segment ?? null,
        city: l.city,
        batteryHealth: l.batteryReport?.verifiedAt
          ? l.batteryReport.sohPercent
          : l.batteryHealth,
        batteryVerified: !!l.batteryReport?.verifiedAt,
        voltScore: l.voltScore,
      })),
    ];

    return { rows };
  });
}
