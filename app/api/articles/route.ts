import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import type { Prisma } from "@prisma/client";
import { touchArticles } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** GET /api/articles?kategori=&q=&limit=&sayfa=&one-cikan=&sirala= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(num(sp.get("limit"), 12), 100);
  const page = num(sp.get("sayfa"), 1);
  const category = sp.get("kategori");
  const q = sp.get("q");
  const featured = sp.get("one-cikan");
  const sort = sp.get("sirala");

  const where: Prisma.ArticleWhereInput = {};
  if (category) where.category = { slug: category };
  if (featured === "1") where.isFeatured = true;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { spot: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  return handle(async () => {
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy:
          sort === "populer" ? { views: "desc" } : { publishedAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          category: { select: { name: true, slug: true, color: true } },
          author: { select: { name: true, slug: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  });
}

/** POST /api/articles - yeni haber */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, spot, content, image, categoryId } = body;

    if (!title || !spot || !content || !categoryId) {
      return fail("title, spot, content ve categoryId zorunludur");
    }

    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(title);
    const exists = await prisma.article.findUnique({ where: { slug } });

    const article = await prisma.article.create({
      data: {
        title,
        slug: exists ? `${slug}-${Date.now().toString().slice(-5)}` : slug,
        spot,
        content,
        image: image || "/haber-placeholder.svg",
        imageCredit: body.imageCredit || "Evos Görsel Arşivi",
        gallery: body.gallery ?? [],
        tags: body.tags ?? [],
        categoryId,
        authorId: body.authorId || null,
        isFeatured: !!body.isFeatured,
        isHeadline: !!body.isHeadline,
        isBreaking: !!body.isBreaking,
        isVideo: !!body.isVideo,
        readTime: Number(body.readTime) || 3,
        status: ["DRAFT", "PUBLISHED", "REJECTED"].includes(body.status)
          ? body.status
          : "PUBLISHED",
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
      include: { category: true },
    });

    touchArticles();
    return ok({ article }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Haber oluşturulamadı", 500);
  }
}
