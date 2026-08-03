import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ username: string }> };

/** GET /api/users/[username] — herkese açık profil özeti */
export async function GET(req: NextRequest, { params }: Ctx) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      city: true,
      website: true,
      twitter: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
  });
  if (!user || user.isBanned) return fail("Kullanıcı bulunamadı", 404);

  const viewer = await getRequestUser(req);
  const [comments, likes, followers, following, isFollowing] = await Promise.all([
    prisma.comment.count({ where: { userId: user.id } }),
    prisma.articleLike.count({ where: { userId: user.id } }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    viewer
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: user.id,
            },
          },
        })
      : null,
  ]);

  const { isBanned: _isBanned, ...profile } = user;
  return ok({
    user: profile,
    stats: { comments, likes, followers, following },
    isFollowing: Boolean(isFollowing),
    isSelf: viewer?.id === user.id,
  });
}
