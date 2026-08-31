import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  POST_SELECT,
  canViewPost,
  decoratePosts,
  normalizeVisibility,
} from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/posts/[id] — tek gönderi (görünürlük kontrolüyle) */
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const viewer = await getRequestUser(req);

  const post = await prisma.post.findUnique({
    where: { id },
    select: { ...POST_SELECT, authorId: true, isHidden: true },
  });
  if (!post) return fail("Gönderi bulunamadı", 404);

  const allowed = await canViewPost(post, viewer?.id ?? null);
  if (!allowed) return fail("Bu gönderiyi görüntüleme yetkiniz yok", 403);

  const { authorId: _a, isHidden: _h, ...rest } = post;
  const [item] = await decoratePosts([rest], viewer?.id ?? null);
  return ok({ post: item });
}

/** DELETE /api/posts/[id] — sahibi veya yönetici siler */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const viewer = await getRequestUser(req);
  const isAdmin = await isAdminRequest(req);

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!post) return fail("Gönderi bulunamadı", 404);

  const isOwner = viewer?.id === post.authorId;
  const isModerator = isAdmin || viewer?.role === "admin" || viewer?.role === "editor";
  if (!isOwner && !isModerator) return fail("Bu gönderiyi silemezsiniz", 403);

  try {
    // İlişkili beğeni ve yorumlar da temizlenir
    await prisma.postLike.deleteMany({ where: { postId: id } });
    await prisma.postComment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Gönderi silinemedi", 500);
  }
}

/** PATCH /api/posts/[id] — görünürlük güncelleme veya moderasyonla gizleme */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const viewer = await getRequestUser(req);
  const isAdmin = await isAdminRequest(req);

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!post) return fail("Gönderi bulunamadı", 404);

  try {
    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};

    if (typeof body.isHidden === "boolean") {
      if (!isAdmin && viewer?.role !== "admin")
        return fail("Bu işlem için yetkiniz yok", 403);
      data.isHidden = body.isHidden;
    }

    if (typeof body.visibility === "string") {
      if (viewer?.id !== post.authorId)
        return fail("Bu gönderiyi düzenleyemezsiniz", 403);
      data.visibility = normalizeVisibility(body.visibility);
    }

    if (Object.keys(data).length === 0) return fail("Güncellenecek alan yok");

    await prisma.post.update({ where: { id }, data });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}
