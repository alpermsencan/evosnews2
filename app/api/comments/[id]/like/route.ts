import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/comments/[id]/like — beğeniyi aç/kapat.
 * `likes` alanı üyelik öncesi beğenileri de içerdiği için sayaç olarak korunur.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getRequestUser(req);
  if (!user) return fail("Beğenmek için giriş yapmalısınız", 401);

  try {
    const { id: commentId } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, articleId: true },
    });
    if (!comment) return fail("Yorum bulunamadı", 404);

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: user.id } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: { likes: { decrement: 1 } },
        select: { likes: true },
      });
      return ok({ liked: false, likes: Math.max(0, updated.likes) });
    }

    await prisma.commentLike.create({ data: { commentId, userId: user.id } });
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });

    if (comment.userId) {
      const article = await prisma.article.findUnique({
        where: { id: comment.articleId },
        select: { slug: true },
      });
      await notify({
        userId: comment.userId,
        actorId: user.id,
        type: "comment_like",
        message: `${user.name} yorumunu beğendi`,
        href: article ? `/haber/${article.slug}#yorum-${commentId}` : undefined,
      });
    }

    return ok({ liked: true, likes: updated.likes });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Beğenilemedi", 500);
  }
}
