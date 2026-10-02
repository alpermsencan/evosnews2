import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import RedditCommunity from "@/components/community/RedditCommunity";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "r/e-aracim — Elektrikli Araç Topluluğu",
  description:
    "Elektrikli araç sahiplerinin deneyim paylaştığı, soru sorduğu, menzil ve şarj verilerini tartıştığı r/e-aracim topluluğu.",
};

export default async function CommunityPage() {
  let viewer = null;
  let posts: any[] = [];
  let topics: string[] = [];

  try {
    const [user, fetchedPosts, fetchedTopics] = await Promise.all([
      getCurrentUser(),
      prisma.communityPost.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      }),
      prisma.communityPost.findMany({
        select: { topic: true },
        distinct: ["topic"],
        orderBy: { topic: "asc" },
      }),
    ]);
    viewer = user;
    posts = fetchedPosts;
    topics = fetchedTopics.map((t) => t.topic).filter(Boolean);
  } catch {
    // Veritabanı gecikmelerine karşı fallback
  }

  // Varsayılan konular
  if (topics.length === 0) {
    topics = ["Genel", "Togg", "Tesla", "Şarj Deneyimi", "Uzun Yol", "Kış Menzili", "Batarya & Sağlık"];
  }

  return (
    <div className="py-4 sm:py-6">
      <RedditCommunity
        initialPosts={posts.map((p) => ({
          ...p,
          createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        }))}
        topics={topics}
        viewer={viewer}
      />
    </div>
  );
}
