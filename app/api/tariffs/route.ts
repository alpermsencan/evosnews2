import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok, slugify } from "@/lib/api";
import { touchTariffs } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * Boş bırakılabilen fiyat alanı.
 *
 * Operatörün o kademede hizmeti yoksa alan boş kalmalıdır; 0 yazmak
 * "ücretsiz şarj" anlamına gelir ve uydurma veridir.
 */
const optionalPrice = (v: unknown) => {
  const n = Number(v);
  return v === "" || v == null || !Number.isFinite(n) || n <= 0 ? null : n;
};

/** GET /api/tariffs?q= */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  return handle(async () => {
    const items = await prisma.operatorTariff.findMany({
      where: {
        isActive: true,
        ...(q ? { operator: { contains: q, mode: "insensitive" as const } } : {}),
      },
      orderBy: { operator: "asc" },
    });
    return { items, total: items.length };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.operator) return fail("operator zorunludur");

    const tariff = await prisma.operatorTariff.create({
      data: {
        operator: b.operator,
        slug: slugify(b.slug || b.operator),
        aliases: b.aliases ?? [],
        acPrice: optionalPrice(b.acPrice),
        acPriceMax: optionalPrice(b.acPriceMax),
        dcPrice: optionalPrice(b.dcPrice),
        dcPriceMax: optionalPrice(b.dcPriceMax),
        ultraPrice: optionalPrice(b.ultraPrice),
        ultraPriceMax: optionalPrice(b.ultraPriceMax),
        website: b.website || null,
        note: b.note || null,
        // Panelden girilen kayıt operatörden teyit edilmiş sayılır ve
        // toplu içe aktarım bu satırın üzerine yazmaz.
        source: "manuel",
        sourceUrl: b.sourceUrl || null,
        verifiedAt: new Date(),
        isActive: b.isActive === undefined ? true : !!b.isActive,
      },
    });

    touchTariffs();
    return ok({ tariff }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Tarife eklenemedi", 500);
  }
}
