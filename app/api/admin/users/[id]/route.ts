import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const ROLES = ["uye", "editor", "admin"];

/** PUT /api/admin/users/[id] — rol değiştir / askıya al */
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);

  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return fail("Geçersiz rol");
      data.role = body.role;
    }
    if (body.isBanned !== undefined) data.isBanned = !!body.isBanned;

    if (Object.keys(data).length === 0) return fail("Güncellenecek alan yok");

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, role: true, isBanned: true },
    });
    return ok({ user });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

/** DELETE /api/admin/users/[id] — üyeyi ve tüm sosyal kayıtlarını siler */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);

  try {
    const { id } = await params;

    // MongoDB'de ilişkisel cascade yok; bağlı kayıtlar elle temizlenir
    await prisma.commentLike.deleteMany({ where: { userId: id } });
    await prisma.articleLike.deleteMany({ where: { userId: id } });
    await prisma.bookmark.deleteMany({ where: { userId: id } });
    await prisma.follow.deleteMany({
      where: { OR: [{ followerId: id }, { followingId: id }] },
    });
    await prisma.notification.deleteMany({
      where: { OR: [{ userId: id }, { actorId: id }] },
    });
    // Yorumlar kalır ama üyeliğinden koparılır (haber akışı bozulmasın)
    await prisma.comment.updateMany({
      where: { userId: id },
      data: { userId: null },
    });
    await prisma.user.delete({ where: { id } });

    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
