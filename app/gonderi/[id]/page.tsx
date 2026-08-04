import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  POST_SELECT,
  canViewPost,
  decoratePosts,
  excerpt,
  getFeed,
  type FeedPost,
} from "@/lib/social";
import PostCard from "@/components/social/PostCard";
import type { SocialPost } from "@/components/social/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const toClient = (p: FeedPost) => p as unknown as SocialPost;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      body: true,
      visibility: true,
      isHidden: true,
      author: { select: { name: true } },
    },
  });

  if (!post || post.isHidden || post.visibility !== "public")
    return { title: "Gönderi" };

  return {
    title: `${post.author.name}: ${excerpt(post.body, 40) || "Gönderi"}`,
    description: excerpt(post.body, 160),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const viewer = await getCurrentUser();

  const raw = await prisma.post.findUnique({
    where: { id },
    select: { ...POST_SELECT, authorId: true, isHidden: true },
  });
  if (!raw) notFound();

  const allowed = await canViewPost(raw, viewer?.id ?? null);
  if (!allowed)
    return (
      <div className="flex flex-col items-center gap-3 px-3 py-20 text-center">
        <h1 className="text-lg font-black text-neutral-900">
          Bu gönderi sana kapalı
        </h1>
        <p className="max-w-md text-sm text-neutral-500">
          Gönderi sahibi bunu yalnızca arkadaşlarıyla paylaşmış olabilir.
        </p>
        <Link
          href="/akis"
          className="rounded-md bg-evos px-5 py-2.5 text-[13px] font-black text-white transition hover:bg-evos-dark"
        >
          AKIŞA DÖN
        </Link>
      </div>
    );

  const { authorId: _a, isHidden: _h, ...rest } = raw;
  const [post] = await decoratePosts([rest], viewer?.id ?? null);

  // Aynı kullanıcının diğer paylaşımları
  const others = await getFeed({
    viewerId: viewer?.id ?? null,
    scope: "user",
    authorId: raw.authorId,
    limit: 4,
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <PostCard post={toClient(post)} showComments />

      {others.filter((p) => p.id !== post.id).length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-black tracking-wide text-neutral-500">
            {post.author.name.toUpperCase()} — DİĞER PAYLAŞIMLAR
          </h2>
          {others
            .filter((p) => p.id !== post.id)
            .slice(0, 3)
            .map((p) => (
              <PostCard key={p.id} post={toClient(p)} />
            ))}
        </section>
      )}
    </div>
  );
}
