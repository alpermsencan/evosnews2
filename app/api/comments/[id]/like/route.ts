import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await prisma.comment.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true },
    });
    return ok({ comment });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Beğenilemedi", 500);
  }
}
