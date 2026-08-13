import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/listings/[id]/favorite — favoriye ekle/çıkar.
 *
 * `(listingId, userId)` unique olduğu için mükerrer favori imkânsızdır;
 * ikinci istek kaydı siler (aç/kapat).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Favorilemek için giriş yapın", 401);

  const { id } = await params;

  try {
    const existing = await prisma.listingFavorite.findUnique({
      where: { listingId_userId: { listingId: id, userId: viewer.id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.listingFavorite.delete({ where: { id: existing.id } });
      return ok({ favorited: false });
    }

    await prisma.listingFavorite.create({ data: { listingId: id, userId: viewer.id } });
    return ok({ favorited: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem başarısız", 500);
  }
}
