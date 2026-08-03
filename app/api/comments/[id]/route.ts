import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const ADMIN_COOKIE = "evos_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";

function isAdmin(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return fail("Yetkisiz işlem", 401);
  try {
    const { id } = await params;
    const body = await req.json();
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        ...(body.approved !== undefined && { approved: !!body.approved }),
        ...(body.body !== undefined && { body: body.body }),
      },
    });
    return ok({ comment });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

/** DELETE — yönetici her yorumu, üye yalnızca kendi yorumunu silebilir */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!comment) return fail("Yorum bulunamadı", 404);

    if (!isAdmin(req)) {
      const user = await getRequestUser(req);
      if (!user || !comment.userId || comment.userId !== user.id)
        return fail("Bu yorumu silme yetkiniz yok", 403);
    }

    // Yanıtlar üst yorumla birlikte gider
    await prisma.comment.deleteMany({ where: { parentId: id } });
    await prisma.commentLike.deleteMany({ where: { commentId: id } });
    await prisma.comment.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
