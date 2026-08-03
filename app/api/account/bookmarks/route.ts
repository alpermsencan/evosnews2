import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, num, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/account/bookmarks — okuma listesi */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return fail("Önce giriş yapmalısınız", 401);

  const limit = Math.min(num(req.nextUrl.searchParams.get("limit"), 50), 100);
  const items = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          spot: true,
          image: true,
          publishedAt: true,
          category: { select: { name: true, slug: true, color: true } },
        },
      },
    },
  });

  return ok({ items });
}
