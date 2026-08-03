import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/articles/[id]/bookmark — okuma listesine ekle/çıkar */
export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getRequestUser(req);
  if (!user) return fail("Kaydetmek için giriş yapmalısınız", 401);

  try {
    const { id: articleId } = await params;
    const existing = await prisma.bookmark.findUnique({
      where: { articleId_userId: { articleId, userId: user.id } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return ok({ bookmarked: false });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });
    if (!article) return fail("Haber bulunamadı", 404);

    await prisma.bookmark.create({ data: { articleId, userId: user.id } });
    return ok({ bookmarked: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kaydedilemedi", 500);
  }
}
