import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!listing) return fail("İlan bulunamadı", 404);
  return ok({ listing });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of ["title", "brand", "model", "city", "image", "sellerType", "sellerName", "color", "damage", "description"]) {
      if (b[key] !== undefined) data[key] = b[key];
    }
    for (const key of ["year", "km", "price", "batteryHealth", "rangeKm"]) {
      if (b[key] !== undefined) data[key] = Number(b[key]);
    }
    if (b.isSponsored !== undefined) data.isSponsored = !!b.isSponsored;
    if (b.images !== undefined) data.images = b.images;

    const listing = await prisma.listing.update({ where: { id }, data });
    return ok({ listing });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.listing.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
