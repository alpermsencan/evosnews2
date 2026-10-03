import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import type { Prisma } from "@prisma/client";
import { touchStations } from "@/lib/revalidate";
import { queryLiveChargingStations } from "@/lib/stations-service";

export const dynamic = "force-dynamic";

const optionalNum = (v: unknown) => {
  const n = Number(v);
  return v === "" || v == null || !Number.isFinite(n) || n <= 0 ? null : n;
};

/**
 * GET /api/stations
 * Türkiye genelindeki 16.900+ istasyonu harita görünümüne (viewport bounds)
 * veya arama/operatör/güç filtrelerine göre canlı döndürür.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const minLat = sp.get("minLat") ? Number(sp.get("minLat")) : undefined;
  const maxLat = sp.get("maxLat") ? Number(sp.get("maxLat")) : undefined;
  const minLng = sp.get("minLng") ? Number(sp.get("minLng")) : undefined;
  const maxLng = sp.get("maxLng") ? Number(sp.get("maxLng")) : undefined;

  const city = sp.get("il") || sp.get("city");
  const operator = sp.get("operator") || sp.get("brand");
  const fast = sp.get("hizli");
  const minPower = Number(sp.get("minGuc") || sp.get("minPowerKw"));
  const q = sp.get("q") || sp.get("query");
  const limit = Math.min(num(sp.get("limit") || sp.get("take"), 500), 1500);

  // 1. Canlı EPDK / Babuba Ağından Sorgula
  const liveItems = await queryLiveChargingStations({
    minLat,
    maxLat,
    minLng,
    maxLng,
    brand: operator || undefined,
    minPowerKw: Number.isFinite(minPower) && minPower > 0 ? minPower : undefined,
    q: q || city || undefined,
    take: limit,
  });

  if (liveItems && liveItems.length > 0) {
    let filtered = liveItems;
    if (fast === "1") {
      filtered = filtered.filter((s) => s.isFast);
    }

    return handle(async () => ({
      items: filtered,
      total: filtered.length,
      source: "epdk_live",
    }));
  }

  // 2. Yedek: Yerel MongoDB Veritabanından Getir
  const where: Prisma.ChargeStationWhereInput = {};
  if (city) where.city = city;
  if (operator && operator !== "Tümü") where.operator = { contains: operator, mode: "insensitive" };
  if (fast === "1") where.isFast = true;
  if (Number.isFinite(minPower) && minPower > 0) where.maxPowerKw = { gte: minPower };
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
        take: limit,
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
      source: "db_fallback",
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
        operator: b.operator || "e-aracım Charge Network",
        city: b.city,
        district: b.district || "",
        address: b.address || "",
        lat: Number(b.lat) || 0,
        lng: Number(b.lng) || 0,
        socketCount: Number(b.socketCount) || 2,
        maxPowerKw: optionalNum(b.maxPowerKw),
        socketTypes: b.socketTypes ?? ["Type 2"],
        pricePerKwh: optionalNum(b.pricePerKwh),
        isFast: !!b.isFast,
        is24h: b.is24h === undefined ? null : !!b.is24h,
        amenities: b.amenities ?? [],
        status: b.status || "aktif",
      },
    });
    touchStations();
    return ok({ station }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İstasyon eklenemedi", 500);
  }
}
