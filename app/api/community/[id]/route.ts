import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** POST = beğeni artır */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const post = await prisma.communityPost.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true },
    });
    return ok({ post });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Beğenilemedi", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const post = await prisma.communityPost.update({
      where: { id },
      data: {
        ...(b.title !== undefined && { title: b.title }),
        ...(b.body !== undefined && { body: b.body }),
        ...(b.topic !== undefined && { topic: b.topic }),
        ...(b.isPinned !== undefined && { isPinned: !!b.isPinned }),
      },
    });
    return ok({ post });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.communityPost.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
