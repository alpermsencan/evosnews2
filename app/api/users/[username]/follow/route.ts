import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ username: string }> };

/** POST /api/users/[username]/follow — takibi aç/kapat */
export async function POST(req: NextRequest, { params }: Ctx) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Takip etmek için giriş yapmalısınız", 401);

  try {
    const { username } = await params;
    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true, isBanned: true },
    });
    if (!target || target.isBanned) return fail("Kullanıcı bulunamadı", 404);
    if (target.id === viewer.id) return fail("Kendinizi takip edemezsiniz");

    const key = { followerId: viewer.id, followingId: target.id };
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: key },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
    } else {
      await prisma.follow.create({ data: key });
      await notify({
        userId: target.id,
        actorId: viewer.id,
        type: "follow",
        message: `${viewer.name} seni takip etmeye başladı`,
        href: `/profil/${viewer.username}`,
      });
    }

    const followers = await prisma.follow.count({
      where: { followingId: target.id },
    });
    return ok({ following: !existing, followers });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem yapılamadı", 500);
  }
}
