import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";
import { touchStations } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const station = await prisma.chargeStation.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!station) return fail("İstasyon bulunamadı", 404);
  return ok({ station });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of ["name", "operator", "city", "district", "address", "status"]) {
      if (b[key] !== undefined) data[key] = b[key];
    }
    // Boş bırakılabilen alanlar: 0/boş gelirse null yazılır.
    for (const key of ["maxPowerKw", "pricePerKwh"]) {
      if (b[key] === undefined) continue;
      const n = Number(b[key]);
      data[key] = b[key] === "" || b[key] === null || !Number.isFinite(n) || n <= 0 ? null : n;
    }
    for (const key of ["lat", "lng", "socketCount"]) {
      if (b[key] !== undefined) data[key] = Number(b[key]);
    }
    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.isFast !== undefined) data.isFast = !!b.isFast;
    if (b.is24h !== undefined) data.is24h = b.is24h === null ? null : !!b.is24h;
    if (b.socketTypes !== undefined) data.socketTypes = b.socketTypes;
    if (b.amenities !== undefined) data.amenities = b.amenities;

    const station = await prisma.chargeStation.update({ where: { id }, data });
    touchStations();
    return ok({ station });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.chargeStation.delete({ where: { id } });
    touchStations();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
