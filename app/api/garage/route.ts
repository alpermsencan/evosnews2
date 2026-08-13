import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";
import { touch } from "@/lib/revalidate";
import { TAGS } from "@/lib/cache";

export const dynamic = "force-dynamic";

const STATUSES = ["AKTIF", "OPSIYONEL", "ABONELIK", "PASIF"] as const;

/** GET /api/garage?marka=&model= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get("marka");
  const model = sp.get("model");

  return handle(async () => {
    const items = await prisma.garageFeature.findMany({
      where: { ...(brand ? { brand } : {}), ...(model ? { model } : {}) },
      orderBy: [{ brand: "asc" }, { model: "asc" }, { order: "asc" }, { name: "asc" }],
    });
    return { items, total: items.length };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    for (const f of ["brand", "model", "name"]) {
      if (!b[f]) return fail(`${f} zorunludur`);
    }
    const status = STATUSES.includes(b.status) ? b.status : "AKTIF";

    const feature = await prisma.garageFeature.create({
      data: {
        brand: b.brand,
        model: b.model,
        vehicleSlug: b.vehicleSlug || null,
        name: b.name,
        status,
        note: b.note || null,
        order: Number(b.order) || 0,
        source: b.source || null,
        // Her kayıt ne zaman doğrulandığını taşır; donanım listeleri model
        // yılına göre değiştiği için tarihsiz bilgi bir süre sonra yanıltır.
        verifiedAt: new Date(),
      },
    });

    touch(TAGS.vehicles);
    return ok({ feature }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Özellik eklenemedi", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return fail("id gerekli");
  try {
    await prisma.garageFeature.delete({ where: { id } });
    touch(TAGS.vehicles);
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
