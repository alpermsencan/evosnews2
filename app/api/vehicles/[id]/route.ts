import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";
import { touchVehicles } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Her zaman dolu olması gereken sayısal alanlar. */
const NUMERIC = [
  "year", "price", "otvRate", "rangeKm", "batteryKwh", "motorPowerKw",
  "motorPowerHp", "acceleration", "topSpeed", "consumption",
] as const;

/**
 * Boş bırakılabilen sayısal alanlar. Form boş gönderdiğinde 0 değil null
 * yazılır; aksi hâlde "0 kW DC şarj" gibi yanlış bir veri üretilirdi.
 */
const OPTIONAL_NUMERIC = [
  "dcChargeKw", "chargeMin", "trunkLiter", "rating",
  // Gerçek mevsimsel menzil: ölçüm yoksa boş kalır, WLTP'den türetilmez.
  "rangeSummerKm", "rangeWinterKm",
] as const;

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!vehicle) return fail("Araç bulunamadı", 404);
  return ok({ vehicle });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of ["brand", "model", "segment", "bodyType", "image", "driveType", "description", "rangeSource"]) {
      if (b[key] !== undefined) data[key] = b[key];
    }
    for (const key of NUMERIC) {
      if (b[key] !== undefined) data[key] = Number(b[key]);
    }
    for (const key of OPTIONAL_NUMERIC) {
      if (b[key] === undefined) continue;
      const n = Number(b[key]);
      data[key] = b[key] === "" || b[key] === null || !Number.isFinite(n) || n <= 0 ? null : n;
    }
    if (b.warranty !== undefined) data.warranty = String(b.warranty).trim() || null;
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.isFeatured !== undefined) data.isFeatured = !!b.isFeatured;
    if (b.pros !== undefined) data.pros = b.pros;
    if (b.cons !== undefined) data.cons = b.cons;

    const vehicle = await prisma.vehicle.update({ where: { id }, data });
    touchVehicles();
    return ok({ vehicle });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    touchVehicles();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
