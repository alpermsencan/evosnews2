import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** GET /api/stations?il=&operator=&hizli=1&minGuc= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Prisma.ChargeStationWhereInput = {};

  const city = sp.get("il");
  const operator = sp.get("operator");
  const fast = sp.get("hizli");
  const minPower = Number(sp.get("minGuc"));
  const q = sp.get("q");

  if (city) where.city = city;
  if (operator) where.operator = operator;
  if (fast === "1") where.isFast = true;
  if (Number.isFinite(minPower) && minPower > 0)
    where.maxPowerKw = { gte: minPower };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
    ];
  }

  return handle(async () => {
    const [items, cities, operators] = await Promise.all([
      prisma.chargeStation.findMany({
        where,
        orderBy: [{ maxPowerKw: "desc" }],
        take: Math.min(num(sp.get("limit"), 100), 200),
      }),
      prisma.chargeStation.findMany({
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.chargeStation.findMany({
        select: { operator: true },
        distinct: ["operator"],
        orderBy: { operator: "asc" },
      }),
    ]);
    return {
      items,
      total: items.length,
      cities: cities.map((c) => c.city),
      operators: operators.map((o) => o.operator),
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name || !b.city) return fail("name ve city zorunludur");
    const station = await prisma.chargeStation.create({
      data: {
        name: b.name,
        slug: slugify(b.slug || b.name),
        operator: b.operator || "Evos Charge Network",
        city: b.city,
        district: b.district || "",
        address: b.address || "",
        lat: Number(b.lat) || 0,
        lng: Number(b.lng) || 0,
        socketCount: Number(b.socketCount) || 2,
        maxPowerKw: Number(b.maxPowerKw) || 60,
        socketTypes: b.socketTypes ?? ["Type 2"],
        pricePerKwh: Number(b.pricePerKwh) || 0,
        isFast: !!b.isFast,
        is24h: b.is24h !== false,
        amenities: b.amenities ?? [],
        status: b.status || "aktif",
      },
    });
    return ok({ station }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İstasyon eklenemedi", 500);
  }
}
