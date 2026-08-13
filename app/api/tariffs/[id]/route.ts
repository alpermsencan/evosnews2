import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";
import { touchTariffs } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const PRICE_FIELDS = [
  "acPrice",
  "acPriceMax",
  "dcPrice",
  "dcPriceMax",
  "ultraPrice",
  "ultraPriceMax",
] as const;

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tariff = await prisma.operatorTariff.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!tariff) return fail("Tarife bulunamadı", 404);
  return ok({ tariff });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of ["operator", "website", "note", "sourceUrl"]) {
      if (b[key] !== undefined) data[key] = b[key] || null;
    }
    // Operatör adı boşaltılamaz: kayıt anahtarıdır.
    if (data.operator === null) delete data.operator;

    // Fiyat kademeleri boş bırakılabilir — 0 yerine null yazılır ki arayüz
    // "ücretsiz" değil "—" göstersin.
    for (const key of PRICE_FIELDS) {
      if (b[key] === undefined) continue;
      const n = Number(b[key]);
      data[key] = b[key] === "" || b[key] === null || !Number.isFinite(n) || n <= 0 ? null : n;
    }

    if (b.slug !== undefined) data.slug = slugify(b.slug);
    if (b.aliases !== undefined) data.aliases = b.aliases;
    if (b.isActive !== undefined) data.isActive = !!b.isActive;

    // Elle düzenlenen satır artık derlemeden değil operatörden teyitlidir;
    // toplu içe aktarım (npm run db:tariffs) bunun üzerine yazmaz.
    data.source = "manuel";
    data.verifiedAt = new Date();

    const tariff = await prisma.operatorTariff.update({ where: { id }, data });
    touchTariffs();
    return ok({ tariff });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.operatorTariff.delete({ where: { id } });
    touchTariffs();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
