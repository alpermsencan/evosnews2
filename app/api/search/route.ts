import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/search?q=togg */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  return handle(async () => {
    if (!q) return { q, articles: [], vehicles: [], stations: [], total: 0 };

    const [articles, vehicles, stations] = await Promise.all([
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { spot: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        },
        take: 20,
        orderBy: { publishedAt: "desc" },
        select: { id: true, title: true, slug: true, image: true, publishedAt: true },
      }),
      prisma.vehicle.findMany({
        where: {
          OR: [
            { brand: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, brand: true, model: true, slug: true, price: true, rangeKm: true },
      }),
      prisma.chargeStation.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, name: true, slug: true, city: true, maxPowerKw: true },
      }),
    ]);

    return {
      q,
      articles,
      vehicles,
      stations,
      total: articles.length + vehicles.length + stations.length,
    };
  });
}
