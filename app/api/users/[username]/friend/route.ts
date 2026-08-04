import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser, notify } from "@/lib/auth";
import { countFriends, findFriendship, type FriendStatus } from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ username: string }> };

const ACTIONS = ["request", "accept", "reject", "cancel", "remove"] as const;
type Action = (typeof ACTIONS)[number];

/**
 * POST /api/users/[username]/friend
 * body: { action: "request" | "accept" | "reject" | "cancel" | "remove" }
 *
 * Arkadaşlık tek bir satırla temsil edilir (requester -> addressee).
 * Kabul edildiğinde iki taraf da otomatik olarak birbirini takip eder;
 * böylece arkadaşın paylaşımı doğrudan akışa düşer.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  const viewer = await getRequestUser(req);
  if (!viewer) return fail("Bu işlem için giriş yapmalısınız", 401);

  try {
    const { username } = await params;
    const body = await req.json().catch(() => ({}));
    const action: Action = ACTIONS.includes(body.action) ? body.action : "request";

    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true, name: true, isBanned: true },
    });
    if (!target || target.isBanned) return fail("Kullanıcı bulunamadı", 404);
    if (target.id === viewer.id)
      return fail("Kendinize arkadaşlık isteği gönderemezsiniz");

    const existing = await findFriendship(viewer.id, target.id);
    let status: FriendStatus = "none";

    switch (action) {
      case "request": {
        if (existing?.status === "accepted") {
          status = "friends";
          break;
        }
        if (existing) {
          // Karşı taraf zaten istek göndermişse bu tıklama kabul anlamına gelir
          if (existing.addresseeId === viewer.id) {
            await acceptFriendship(existing.id, existing.requesterId, viewer.id);
            await notify({
              userId: existing.requesterId,
              actorId: viewer.id,
              type: "friend_accept",
              message: `${viewer.name} arkadaşlık isteğini kabul etti`,
              href: `/profil/${viewer.username}`,
            });
            status = "friends";
            break;
          }
          status = "outgoing";
          break;
        }

        await prisma.friendship.create({
          data: { requesterId: viewer.id, addresseeId: target.id },
        });
        await notify({
          userId: target.id,
          actorId: viewer.id,
          type: "friend_request",
          message: `${viewer.name} sana arkadaşlık isteği gönderdi`,
          href: "/arkadaslar",
        });
        status = "outgoing";
        break;
      }

      case "accept": {
        if (!existing || existing.status === "accepted") {
          status = existing ? "friends" : "none";
          break;
        }
        if (existing.addresseeId !== viewer.id)
          return fail("Bu isteği kabul edemezsiniz", 403);

        await acceptFriendship(existing.id, existing.requesterId, viewer.id);
        await notify({
          userId: existing.requesterId,
          actorId: viewer.id,
          type: "friend_accept",
          message: `${viewer.name} arkadaşlık isteğini kabul etti`,
          href: `/profil/${viewer.username}`,
        });
        status = "friends";
        break;
      }

      case "reject":
      case "cancel": {
        if (!existing) break;
        if (existing.status === "accepted") {
          status = "friends";
          break;
        }
        const mine =
          action === "cancel"
            ? existing.requesterId === viewer.id
            : existing.addresseeId === viewer.id;
        if (!mine) return fail("Bu istek üzerinde işlem yapamazsınız", 403);

        await prisma.friendship.delete({ where: { id: existing.id } });
        status = "none";
        break;
      }

      case "remove": {
        if (!existing) break;
        await prisma.friendship.delete({ where: { id: existing.id } });
        // Arkadaşlıktan çıkınca takip bağı korunur; kullanıcı isterse ayrıca bırakır
        status = "none";
        break;
      }
    }

    const friendCount = await countFriends(target.id);
    return ok({ status, friendCount });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem yapılamadı", 500);
  }
}

/** İsteği kabul eder ve iki tarafı karşılıklı takipçi yapar */
async function acceptFriendship(
  friendshipId: string,
  requesterId: string,
  addresseeId: string
) {
  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "accepted", respondedAt: new Date() },
  });

  const pairs = [
    { followerId: requesterId, followingId: addresseeId },
    { followerId: addresseeId, followingId: requesterId },
  ];
  for (const pair of pairs) {
    await prisma.follow
      .upsert({
        where: { followerId_followingId: pair },
        update: {},
        create: pair,
      })
      .catch(() => {});
  }
}
