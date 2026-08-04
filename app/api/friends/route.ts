import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { num, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import { SOCIAL_USER_SELECT, getPeopleSuggestions } from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PERSON = { ...SOCIAL_USER_SELECT, bio: true, city: true } as const;

/**
 * GET /api/friends — arkadaş merkezi verileri
 * ?tab=all (varsayılan) | friends | incoming | outgoing | suggestions
 */
export async function GET(req: NextRequest) {
  const viewer = await getRequestUser(req);
  if (!viewer)
    return ok({ friends: [], incoming: [], outgoing: [], suggestions: [] });

  const tab = String(req.nextUrl.searchParams.get("tab") || "all");
  const limit = Math.min(num(req.nextUrl.searchParams.get("limit"), 50), 100);
  const want = (name: string) => tab === "all" || tab === name;

  const [accepted, incomingRows, outgoingRows, suggestions] = await Promise.all([
    want("friends")
      ? prisma.friendship.findMany({
          where: {
            status: "accepted",
            OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }],
          },
          orderBy: { respondedAt: "desc" },
          take: limit,
          include: {
            requester: { select: PERSON },
            addressee: { select: PERSON },
          },
        })
      : [],
    want("incoming")
      ? prisma.friendship.findMany({
          where: { addresseeId: viewer.id, status: "pending" },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: { requester: { select: PERSON } },
        })
      : [],
    want("outgoing")
      ? prisma.friendship.findMany({
          where: { requesterId: viewer.id, status: "pending" },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: { addressee: { select: PERSON } },
        })
      : [],
    want("suggestions") ? getPeopleSuggestions(viewer.id, 8) : [],
  ]);

  return ok({
    friends: accepted.map((f) =>
      f.requesterId === viewer.id ? f.addressee : f.requester
    ),
    incoming: incomingRows.map((f) => ({
      ...f.requester,
      requestedAt: f.createdAt.toISOString(),
    })),
    outgoing: outgoingRows.map((f) => ({
      ...f.addressee,
      requestedAt: f.createdAt.toISOString(),
    })),
    suggestions,
  });
}
