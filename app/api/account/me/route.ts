import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/account/me — oturumdaki kullanıcı + sayaçlar (yoksa user: null) */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return ok({ user: null });

  const [comments, bookmarks, followers, following, unread] = await Promise.all([
    prisma.comment.count({ where: { userId: user.id } }),
    prisma.bookmark.count({ where: { userId: user.id } }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return ok({
    user,
    stats: { comments, bookmarks, followers, following, unread },
  });
}
