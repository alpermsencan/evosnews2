import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import type { Prisma } from "@prisma/client";
import { touchVehicles } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * Boş bırakılabilen sayısal alanlar.
 * Formdan boş gelen değeri 0 yazmak "DC şarj gücü 0 kW" gibi yanlış bir veri
 * üretir; onun yerine alan tamamen boş bırakılır ve arayüzde "—" görünür.
 */
const optionalInt = (v: unknown) => {
  const n = Number(v);
  return v === "" || v == null || !Number.isFinite(n) || n <= 0 ? null : Math.round(n);
};

const optionalFloat = (v: unknown) => {
  const n = Number(v);
  return v === "" || v == null || !Number.isFinite(n) || n <= 0 ? null : n;
};

/** GET /api/vehicles?marka=&segment=&minFiyat=&maxFiyat=&minMenzil=&sirala= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Prisma.VehicleWhereInput = {};

  const brand = sp.get("marka");
  const segment = sp.get("segment");
  const bodyType = sp.get("kasa");
  const minPrice = Number(sp.get("minFiyat"));
  const maxPrice = Number(sp.get("maxFiyat"));
  const minRange = Number(sp.get("minMenzil"));

  if (brand) where.brand = brand;
  if (segment) where.segment = segment;
  if (bodyType) where.bodyType = bodyType;
  if (Number.isFinite(minPrice) && minPrice > 0)
    where.price = { ...(where.price as object), gte: minPrice };
  if (Number.isFinite(maxPrice) && maxPrice > 0)
    where.price = { ...(where.price as object), lte: maxPrice };
  if (Number.isFinite(minRange) && minRange > 0) where.rangeKm = { gte: minRange };

  const sort = sp.get("sirala");
  const orderBy: Prisma.VehicleOrderByWithRelationInput =
    sort === "fiyat-azalan"
      ? { price: "desc" }
      : sort === "menzil"
      ? { rangeKm: "desc" }
      : sort === "hizlanma"
      ? { acceleration: "asc" }
      : sort === "puan"
      ? // MongoDB'de null, azalan sıralamada sayıların ardına düşer:
        // puanı olmayan (henüz incelenmemiş) araçlar listenin sonunda kalır.
        { rating: "desc" }
      : { price: "asc" };

  return handle(async () => {
    const items = await prisma.vehicle.findMany({
      where,
      orderBy,
      take: Math.min(num(sp.get("limit"), 60), 100),
    });
    return { items, total: items.length };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.brand || !b.model) return fail("brand ve model zorunludur");
    const slug = slugify(b.slug || `${b.brand} ${b.model}`);
    const vehicle = await prisma.vehicle.create({
      data: {
        brand: b.brand,
        model: b.model,
        slug,
        year: Number(b.year) || new Date().getFullYear(),
        segment: b.segment || "C-SUV",
        bodyType: b.bodyType || "SUV",
        image: b.image || "/arac-placeholder.svg",
        price: Number(b.price) || 0,
        otvRate: Number(b.otvRate) || 10,
        rangeKm: Number(b.rangeKm) || 0,
        batteryKwh: Number(b.batteryKwh) || 0,
        motorPowerKw: Number(b.motorPowerKw) || 0,
        motorPowerHp: Number(b.motorPowerHp) || 0,
        acceleration: Number(b.acceleration) || 0,
        topSpeed: Number(b.topSpeed) || 0,
        consumption: Number(b.consumption) || 0,
        driveType: b.driveType || "RWD",
        isFeatured: !!b.isFeatured,
        // Doğrulanabilir kaynağı olmayan alanlar: girilmediyse boş kalır.
        // Sıfır/varsayılan yazmak uydurma veri üretmek olur.
        dcChargeKw: optionalInt(b.dcChargeKw),
        chargeMin: optionalInt(b.chargeMin),
        trunkLiter: optionalInt(b.trunkLiter),
        rangeSummerKm: optionalInt(b.rangeSummerKm),
        rangeWinterKm: optionalInt(b.rangeWinterKm),
        rangeSource: b.rangeSource?.trim() || null,
        warranty: b.warranty?.trim() || null,
        rating: optionalFloat(b.rating),
        pros: b.pros ?? [],
        cons: b.cons ?? [],
        description: b.description || "",
      },
    });
    touchVehicles();
    return ok({ vehicle }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Araç eklenemedi", 500);
  }
}
