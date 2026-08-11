import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";
import { touchArticles } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const article = await prisma.article.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { category: true, author: true, comments: true },
  });
  if (!article) return fail("Haber bulunamadı", 404);
  return ok({ article });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: slugify(body.slug) }),
        ...(body.spot !== undefined && { spot: body.spot }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.imageCredit !== undefined && { imageCredit: body.imageCredit }),
        ...(body.gallery !== undefined && { gallery: body.gallery }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.authorId !== undefined && { authorId: body.authorId || null }),
        ...(body.isFeatured !== undefined && { isFeatured: !!body.isFeatured }),
        ...(body.isHeadline !== undefined && { isHeadline: !!body.isHeadline }),
        ...(body.isBreaking !== undefined && { isBreaking: !!body.isBreaking }),
        ...(body.isVideo !== undefined && { isVideo: !!body.isVideo }),
        ...(body.readTime !== undefined && { readTime: Number(body.readTime) }),
        ...(body.status !== undefined &&
          ["DRAFT", "PUBLISHED", "REJECTED"].includes(body.status) && {
            status: body.status,
          }),
        ...(body.publishedAt !== undefined && {
          publishedAt: new Date(body.publishedAt),
        }),
      },
      include: { category: true },
    });

    touchArticles();
    return ok({ article });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.comment.deleteMany({ where: { articleId: id } });
    await prisma.article.delete({ where: { id } });
    touchArticles();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
