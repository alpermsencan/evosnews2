import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/posts/[id]/view — reel izlenme sayacı.
 * Sayaç kozmetiktir; hata durumunda sessizce geçilir ki oynatma bozulmasın.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.post
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => {});
  return ok({ success: true });
}
