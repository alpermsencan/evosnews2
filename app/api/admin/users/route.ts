import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_COOKIE = "evos_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";

function isAdmin(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === ADMIN_PASSWORD;
}

/** GET /api/admin/users — üye listesi */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return fail("Yetkisiz işlem", 401);

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
