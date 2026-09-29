import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/messages
 * Oturumdaki üyenin gelen ve giden mesajlarını listeler.
 */
export async function GET(req: NextRequest) {
  try {
    const viewer = await getRequestUser(req);
    if (!viewer) return fail("Giriş yapmalısınız", 401);

    const otherUserId = req.nextUrl.searchParams.get("userId");
    const listingId = req.nextUrl.searchParams.get("listingId");

    // Belirli bir kullanıcı veya ilan ile yapılan sohbet
    if (otherUserId) {
      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: viewer.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: viewer.id },
          ],
          ...(listingId ? { listingId } : {}),
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, username: true, avatar: true } },
          receiver: { select: { id: true, name: true, username: true, avatar: true } },
          listing: { select: { id: true, title: true, slug: true, price: true, image: true } },
        },
      });

      // Okunmamış gelen mesajları okundu yap
      await prisma.directMessage.updateMany({
        where: {
          receiverId: viewer.id,
          senderId: otherUserId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return ok({ messages });
    }

    // Tüm gelen/giden mesajları getir ve kullanıcı bazlı konuşmaları grupla
    const allMessages = await prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: viewer.id }, { receiverId: viewer.id }],
      },
      orderBy: { createdAt: "desc" },
      take: 150,
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } },
        receiver: { select: { id: true, name: true, username: true, avatar: true } },
        listing: { select: { id: true, title: true, slug: true, price: true, image: true } },
      },
    });

    // Karşı taraf bazında en son mesajları ve okunmamış sayısını derle
    const conversationsMap = new Map<string, {
      otherUser: { id: string; name: string; username: string; avatar: string | null };
      lastMessage: typeof allMessages[number];
      unreadCount: number;
    }>();

    for (const msg of allMessages) {
      const isSender = msg.senderId === viewer.id;
      const other = isSender ? msg.receiver : msg.sender;
      if (!other) continue;

      const existing = conversationsMap.get(other.id);
      if (!existing) {
        conversationsMap.set(other.id, {
          otherUser: other,
          lastMessage: msg,
          unreadCount: !isSender && !msg.isRead ? 1 : 0,
        });
      } else {
        if (!isSender && !msg.isRead) {
          existing.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return ok({ conversations, totalMessages: allMessages.length });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Mesajlar yüklenemedi", 500);
  }
}

/**
 * POST /api/messages
 * Yeni doğrudan mesaj gönderir.
 */
export async function POST(req: NextRequest) {
  try {
    const viewer = await getRequestUser(req);
    if (!viewer) return fail("Mesaj göndermek için giriş yapmalısınız", 401);

    const body = await req.json();
    const content = String(body.content || "").trim();
    const receiverId = body.receiverId ? String(body.receiverId) : null;
    const listingId = body.listingId ? String(body.listingId) : null;

    if (!content) return fail("Mesaj içeriği boş olamaz", 400);
    if (content.length > 2000) return fail("Mesaj 2000 karakterden uzun olamaz", 400);

    let targetReceiverId = receiverId;

    // Eğer receiverId verilmemiş ama listingId verilmişse, ilanın sahibini bul
    let targetListing = null;
    if (listingId) {
      targetListing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, userId: true, title: true, slug: true },
      });

      if (!targetListing) return fail("İlan bulunamadı", 404);
      if (!targetReceiverId && targetListing.userId) {
        targetReceiverId = targetListing.userId;
      }
    }

    if (!targetReceiverId) {
      return fail("Mesaj gönderilecek satıcı / kullanıcı belirlenemedi", 400);
    }

    if (targetReceiverId === viewer.id) {
      return fail("Kendi kendinize mesaj gönderemezsiniz", 400);
    }

    const receiverUser = await prisma.user.findUnique({
      where: { id: targetReceiverId },
      select: { id: true, name: true, username: true },
    });

    if (!receiverUser) return fail("Alıcı kullanıcı bulunamadı", 404);

    const message = await prisma.directMessage.create({
      data: {
        senderId: viewer.id,
        receiverId: targetReceiverId,
        listingId: targetListing?.id ?? null,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true } },
        receiver: { select: { id: true, name: true, username: true, avatar: true } },
        listing: { select: { id: true, title: true, slug: true, price: true, image: true } },
      },
    });

    // Alıcıya bildirim bırak
    try {
      await prisma.notification.create({
        data: {
          userId: targetReceiverId,
          actorId: viewer.id,
          type: "direct_message",
          message: `${viewer.name} size bir mesaj gönderdi: "${content.slice(0, 60)}${content.length > 60 ? "..." : ""}"`,
          href: `/hesabim/mesajlar?user=${viewer.id}`,
        },
      });
    } catch (notifErr) {
      console.error("Bildirim oluşturulamadı:", notifErr);
    }

    return ok({ message }, 201);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Mesaj gönderilemedi", 500);
  }
}
