import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/articles/[id]/like — beğeniyi aç/kapat */
export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getRequestUser(req);
  if (!user) return fail("Beğenmek için giriş yapmalısınız", 401);

  try {
    const { id: articleId } = await params;
    const existing = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId: user.id } },
    });

    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } });
    } else {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true },
      });
      if (!article) return fail("Haber bulunamadı", 404);
      await prisma.articleLike.create({ data: { articleId, userId: user.id } });
    }

    const count = await prisma.articleLike.count({ where: { articleId } });
    return ok({ liked: !existing, count });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Beğenilemedi", 500);
  }
}
