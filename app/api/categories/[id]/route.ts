import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, slugify } from "@/lib/api";
import { touchCategories } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: slugify(body.slug) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.order !== undefined && { order: Number(body.order) }),
        ...(body.isMainNav !== undefined && { isMainNav: !!body.isMainNav }),
        ...(body.href !== undefined && { href: body.href }),
      },
    });
    touchCategories();
    return ok({ category });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const count = await prisma.article.count({ where: { categoryId: id } });
    if (count > 0)
      return fail(
        `Bu kategoride ${count} haber var. Önce haberleri taşıyın veya silin.`,
        409
      );
    await prisma.category.delete({ where: { id } });
    touchCategories();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
