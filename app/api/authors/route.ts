import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok, slugify } from "@/lib/api";
import { touchArticles } from "@/lib/revalidate";

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
        avatar: b.avatar || null,
        twitter: b.twitter || null,
      },
    });
    // Yazar adı ve avatarı haber kartlarında görünür; önbellekli haber
    // sorguları tazelenmezse eski isimle kalırlar.
    touchArticles();
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
    touchArticles();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
