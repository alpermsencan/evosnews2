import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const articleId = sp.get("haber");
  const limit = Math.min(num(sp.get("limit"), 50), 200);

  return handle(async () => {
    const items = await prisma.comment.findMany({
      where: articleId ? { articleId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { article: { select: { title: true, slug: true } } },
    });
    return { items };
  });
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, name, body } = await req.json();
    if (!articleId || !name?.trim() || !body?.trim())
      return fail("articleId, name ve body zorunludur");
    if (body.trim().length < 3) return fail("Yorum çok kısa");

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return fail("Haber bulunamadı", 404);

    const comment = await prisma.comment.create({
      data: {
        articleId,
        name: name.trim().slice(0, 40),
        body: body.trim().slice(0, 1200),
      },
    });

    return ok({ comment }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yorum eklenemedi", 500);
  }
}
