import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/users — üye listesi */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
  });
  return ok({ users });
}
