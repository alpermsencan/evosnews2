import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  POST_SELECT,
  canViewPost,
  decoratePosts,
  getFeed,
  type FeedPost,
} from "@/lib/social";
import ReelsViewer from "@/components/social/ReelsViewer";
import type { SocialPost } from "@/components/social/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reels",
  description:
    "Elektrikli araç sahiplerinden kısa dikey videolar: test sürüşleri, şarj deneyimleri ve araç turları.",
};

type Props = { searchParams: Promise<{ id?: string }> };

const toClient = (p: FeedPost) => p as unknown as SocialPost;

export default async function ReelsPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const viewer = await getCurrentUser();
  const viewerId = viewer?.id ?? null;

  const feed = await getFeed({
    viewerId,
    scope: "explore",
    kind: "reel",
    limit: 8,
  });

  let items = feed;

  // Derin bağlantıyla gelinen reel listenin başına alınır
  if (id) {
    const target = await prisma.post.findUnique({
      where: { id },
      select: { ...POST_SELECT, authorId: true, isHidden: true },
    });

    if (target && target.kind === "reel" && (await canViewPost(target, viewerId))) {
      const { authorId: _a, isHidden: _h, ...rest } = target;
      const [decorated] = await decoratePosts([rest], viewerId);
      items = [decorated, ...feed.filter((p) => p.id !== decorated.id)];
    }
  }

  const list = items.map(toClient);
  const cursor = feed.length > 0 ? feed[feed.length - 1].createdAt : null;

  return (
    <div className="px-0 py-0 sm:px-0 sm:py-4">
      <ReelsViewer initialItems={list} initialCursor={cursor} />
    </div>
  );
}
