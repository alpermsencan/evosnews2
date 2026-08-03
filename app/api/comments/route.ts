import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COMMENT_USER = {
  select: { id: true, name: true, username: true, avatar: true },
} as const;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const articleId = sp.get("haber");
  const limit = Math.min(num(sp.get("limit"), 50), 200);

  return handle(async () => {
    const items = await prisma.comment.findMany({
      where: articleId ? { articleId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        article: { select: { title: true, slug: true } },
        user: COMMENT_USER,
      },
    });
    return { items };
  });
}

/** POST /api/comments — yorum veya yanıt (giriş zorunlu) */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return fail("Yorum yapmak için giriş yapmalısınız", 401);

  try {
    const { articleId, body, parentId } = await req.json();
    if (!articleId || !body?.trim()) return fail("articleId ve body zorunludur");
    if (body.trim().length < 3) return fail("Yorum çok kısa");

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true },
    });
    if (!article) return fail("Haber bulunamadı", 404);

    let parent = null;
    if (parentId) {
      parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, userId: true, articleId: true },
      });
      if (!parent || parent.articleId !== articleId)
        return fail("Yanıtlanan yorum bulunamadı", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: user.id,
        name: user.name,
        body: body.trim().slice(0, 1200),
        parentId: parent?.id ?? null,
      },
      include: { user: COMMENT_USER },
    });

    if (parent?.userId) {
      await notify({
        userId: parent.userId,
        actorId: user.id,
        type: "reply",
        message: `${user.name} yorumunu yanıtladı`,
        href: `/haber/${article.slug}#yorum-${comment.id}`,
      });
    }

    return ok({ comment }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yorum eklenemedi", 500);
  }
}
