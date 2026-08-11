import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";
import { touchPoll } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.poll.findMany({ orderBy: { createdAt: "desc" } });
    return { items };
  });
}

/** POST /api/poll -> { pollId, optionIndex } */
export async function POST(req: NextRequest) {
  try {
    const { pollId, optionIndex } = await req.json();
    if (!pollId || typeof optionIndex !== "number")
      return fail("pollId ve optionIndex zorunludur");

    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return fail("Anket bulunamadı", 404);
    if (optionIndex < 0 || optionIndex >= poll.options.length)
      return fail("Geçersiz seçenek");

    const votes = [...poll.votes];
    votes[optionIndex] = (votes[optionIndex] ?? 0) + 1;

    const updated = await prisma.poll.update({
      where: { id: pollId },
      data: { votes },
      select: { votes: true, options: true },
    });

    touchPoll();
    return ok({ votes: updated.votes, options: updated.options });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Oy kaydedilemedi", 500);
  }
}
