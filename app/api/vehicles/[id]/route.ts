import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const NUMERIC = [
  "year", "price", "otvRate", "rangeKm", "batteryKwh", "motorPowerKw",
  "motorPowerHp", "acceleration", "topSpeed", "dcChargeKw", "chargeMin",
  "consumption", "trunkLiter", "rating",
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

    for (const key of ["brand", "model", "segment", "bodyType", "image", "driveType", "description"]) {
      if (b[key] !== undefined) data[key] = b[key];
    }
    for (const key of NUMERIC) {
      if (b[key] !== undefined) data[key] = Number(b[key]);
    }
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.isFeatured !== undefined) data.isFeatured = !!b.isFeatured;
    if (b.pros !== undefined) data.pros = b.pros;
    if (b.cons !== undefined) data.cons = b.cons;

    const vehicle = await prisma.vehicle.update({ where: { id }, data });
    return ok({ vehicle });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
