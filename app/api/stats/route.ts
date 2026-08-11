import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Admin panel özet istatistikleri */
export async function GET() {
  return handle(async () => {
    const [
      articles,
      categories,
      comments,
      vehicles,
      stations,
      community,
      subscribers,
      leads,
      views,
      topArticles,
      recentComments,
      perCategory,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.vehicle.count(),
      prisma.chargeStation.count(),
      prisma.communityPost.count(),
      prisma.subscriber.count(),
      prisma.lead.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.findMany({
        orderBy: { views: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, views: true },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { article: { select: { title: true, slug: true } } },
      }),
      prisma.category.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          slug: true,
          _count: { select: { articles: true } },
        },
      }),
    ]);

    return {
      counts: {
        articles,
        categories,
        comments,
        vehicles,
        stations,
        community,
        subscribers,
        leads,
        totalViews: views._sum.views ?? 0,
      },
      topArticles,
      recentComments,
      perCategory,
    };
  });
}
