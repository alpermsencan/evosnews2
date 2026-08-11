import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import { touchCommunity } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const topic = sp.get("konu");

  return handle(async () => {
    const items = await prisma.communityPost.findMany({
      where: topic ? { topic } : undefined,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: Math.min(num(sp.get("limit"), 40), 100),
    });
    return { items, total: items.length };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.title?.trim() || !b.body?.trim() || !b.author?.trim())
      return fail("title, body ve author zorunludur");

    const slug = `${slugify(b.title)}-${Date.now().toString().slice(-4)}`;
    const post = await prisma.communityPost.create({
      data: {
        title: b.title.trim().slice(0, 140),
        slug,
        body: b.body.trim().slice(0, 2000),
        author: b.author.trim().slice(0, 40),
        avatar: b.avatar || null,
        topic: b.topic || "Genel",
        isPinned: !!b.isPinned,
      },
    });
    touchCommunity();
    return ok({ post }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Gönderi eklenemedi", 500);
  }
}
