import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, num, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";
import { SOCIAL_USER_SELECT, canViewPost, excerpt } from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const MAX_BODY = 600;

/** GET /api/posts/[id]/comments — gönderi yorumları (eskiden yeniye) */
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const viewer = await getRequestUser(req);

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, visibility: true, isHidden: true },
  });
  if (!post) return fail("Gönderi bulunamadı", 404);
  if (!(await canViewPost(post, viewer?.id ?? null)))
    return fail("Bu gönderiye erişiminiz yok", 403);

  const items = await prisma.postComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    take: Math.min(num(req.nextUrl.searchParams.get("limit"), 50), 200),
    include: { user: { select: SOCIAL_USER_SELECT } },
  });

  return ok({
    items: items.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      isMine: c.userId === viewer?.id,
    })),
  });
}

/** POST /api/posts/[id]/comments — yorum ekler */
export async function POST(req: NextRequest, { params }: Ctx) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Yorum yapmak için giriş yapmalısınız", 401);

  try {
    const { id } = await params;
    const payload = await req.json();
    const text = String(payload.body ?? "").trim().slice(0, MAX_BODY);
    if (!text) return fail("Yorum boş olamaz");

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, visibility: true, isHidden: true, kind: true },
    });
    if (!post) return fail("Gönderi bulunamadı", 404);
    if (!(await canViewPost(post, viewer.id)))
      return fail("Bu gönderiye erişiminiz yok", 403);

    const comment = await prisma.postComment.create({
      data: { postId: id, userId: viewer.id, body: text },
      include: { user: { select: SOCIAL_USER_SELECT } },
    });

    const commentCount = await prisma.postComment.count({ where: { postId: id } });
    await prisma.post.update({ where: { id }, data: { commentCount } });

    await notify({
      userId: post.authorId,
      actorId: viewer.id,
      type: "post_comment",
      message: `${viewer.name} ${
        post.kind === "reel" ? "reel'ine" : "gönderine"
      } yorum yaptı: ${excerpt(text, 50)}`,
      href: `/gonderi/${id}`,
    });

    return ok(
      {
        comment: {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          isMine: true,
        },
        commentCount,
      },
      201
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yorum eklenemedi", 500);
  }
}

/** DELETE /api/posts/[id]/comments?commentId=... — yorum sahibi veya gönderi sahibi siler */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Giriş yapmalısınız", 401);

  const { id } = await params;
  const commentId = req.nextUrl.searchParams.get("commentId");
  if (!commentId) return fail("commentId parametresi gerekli");

  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, post: { select: { authorId: true } } },
  });
  if (!comment) return fail("Yorum bulunamadı", 404);

  const allowed =
    comment.userId === viewer.id ||
    comment.post.authorId === viewer.id ||
    viewer.role === "admin";
  if (!allowed) return fail("Bu yorumu silemezsiniz", 403);

  try {
    await prisma.postComment.delete({ where: { id: commentId } });
    const commentCount = await prisma.postComment.count({ where: { postId: id } });
    await prisma.post.update({ where: { id }, data: { commentCount } });
    return ok({ success: true, commentCount });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Yorum silinemedi", 500);
  }
}
