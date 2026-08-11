import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok, slugify } from "@/lib/api";
import { touchCategories } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return { items };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return fail("name zorunludur");
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.slug || body.name),
        description: body.description || null,
        color: body.color || "#e30613",
        icon: body.icon || null,
        order: Number(body.order) || 99,
        isMainNav: !!body.isMainNav,
        href: body.href || null,
      },
    });
    touchCategories();
    return ok({ category }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kategori oluşturulamadı", 500);
  }
}
