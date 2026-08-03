import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok, slugify } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    return { items };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name) return fail("name zorunludur");
    const slug = slugify(b.slug || b.name);
    const author = await prisma.author.create({
      data: {
        name: b.name,
        slug,
        title: b.title || null,
        bio: b.bio || null,
        avatar: b.avatar || `https://picsum.photos/seed/author-${slug}/200/200`,
        twitter: b.twitter || null,
      },
    });
    return ok({ author }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yazar eklenemedi", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("id zorunludur");
    await prisma.article.updateMany({
      where: { authorId: id },
      data: { authorId: null },
    });
    await prisma.author.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
