import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";
import { canViewPost, excerpt } from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/posts/[id]/like — beğeniyi aç/kapat */
export async function POST(req: NextRequest, { params }: Ctx) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Beğenmek için giriş yapmalısınız", 401);

  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        kind: true,
        body: true,
        authorId: true,
        visibility: true,
        isHidden: true,
      },
    });
    if (!post) return fail("Gönderi bulunamadı", 404);
    if (!(await canViewPost(post, viewer.id)))
      return fail("Bu gönderiye erişiminiz yok", 403);

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: viewer.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.postLike.create({ data: { postId: id, userId: viewer.id } });
      await notify({
        userId: post.authorId,
        actorId: viewer.id,
        type: "post_like",
        message: `${viewer.name} ${
          post.kind === "reel" ? "reel'ini" : "gönderini"
        } beğendi${post.body ? `: ${excerpt(post.body, 40)}` : ""}`,
        href: `/gonderi/${id}`,
      });
    }

    // Sayaç, kayıtların gerçek sayısıyla senkron tutulur
    const likeCount = await prisma.postLike.count({ where: { postId: id } });
    await prisma.post.update({ where: { id }, data: { likeCount } });

    return ok({ liked: !existing, likeCount });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem yapılamadı", 500);
  }
}
