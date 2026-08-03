import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, num, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/notifications — oturumdaki kullanıcının bildirimleri */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return ok({ items: [], unread: 0 });

  const limit = Math.min(num(req.nextUrl.searchParams.get("limit"), 30), 100);
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: { name: true, username: true, avatar: true } },
      },
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return ok({ items, unread });
}

/** PUT /api/notifications — tümünü (veya verilen id'leri) okundu işaretle */
export async function PUT(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return fail("Önce giriş yapmalısınız", 401);

  try {
    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
        ...(ids.length > 0 && { id: { in: ids } }),
      },
      data: { isRead: true },
    });

    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}
