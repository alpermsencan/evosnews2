import { prisma } from "@/lib/prisma";
import FacebookCommunity from "@/components/community/FacebookCommunity";

export const revalidate = 60;
export const metadata = {
  title: "Topluluk — Elektrikli Araç Sosyal Ağı",
  description:
    "Elektrikli araç sahiplerinin deneyim paylaştığı, soru sorduğu ve yardımlaştığı Facebook tarzı sosyal topluluk.",
};

export default async function CommunityPage() {
  let posts: any[] = [];
  let topics: string[] = [];

  try {
    const [fetchedPosts, fetchedTopics] = await Promise.all([
      prisma.communityPost.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      }),
      prisma.communityPost.findMany({
        select: { topic: true },
        distinct: ["topic"],
        orderBy: { topic: "asc" },
      }),
    ]);
    posts = fetchedPosts;
    topics = fetchedTopics.map((t) => t.topic).filter(Boolean);
  } catch {
    // Veritabanı gecikmelerine karşı fallback
  }

  // Varsayılan konular
  if (topics.length === 0) {
    topics = ["Genel", "Togg", "Tesla", "Şarj Deneyimi", "Uzun Yol", "Kış Menzili"];
  }

  return (
    <FacebookCommunity
      initialPosts={posts.map((p) => ({
        ...p,
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      }))}
      topics={topics}
    />
  );
}
