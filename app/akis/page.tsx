import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  countFriends,
  getFeed,
  getPeopleSuggestions,
  type FeedPost,
} from "@/lib/social";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/user/Avatar";
import PostComposer from "@/components/social/PostComposer";
import PostFeed from "@/components/social/PostFeed";
import SuggestionList from "@/components/social/SuggestionList";
import type { SocialPost } from "@/components/social/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Akışım",
  description:
    "Takip ettiğin ve arkadaş olduğun kullanıcıların paylaşımları ve sana özel haber akışı.",
};

const PAGE = 10;

/** Sunucu tipini istemci tipine dönüştürür (alanlar birebir aynıdır) */
const toClient = (p: FeedPost) => p as unknown as SocialPost;

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/akis");

  const [posts, suggestions, friendCount, incoming, bookmarks, latest] =
    await Promise.all([
      getFeed({ viewerId: user.id, scope: "feed", limit: PAGE }),
      getPeopleSuggestions(user.id, 5),
      countFriends(user.id),
      prisma.friendship.count({
        where: { addresseeId: user.id, status: "pending" },
      }),
      prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          article: { select: { title: true, slug: true } },
        },
      }),
      prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          category: { select: { name: true, color: true } },
        },
      }),
    ]);

  const items = posts.map(toClient);
  const cursor = items.length > 0 ? items[items.length - 1].createdAt : null;

  return (
    <div className="grid gap-4 px-3 py-4 sm:px-0 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Ana sütun */}
      <div className="flex flex-col gap-4">
        {/* Kimlik kartı */}
        <section className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <Link
              href={`/profil/${user.username}`}
              className="truncate text-[15px] font-black text-neutral-900 hover:text-evos"
            >
              {user.name}
            </Link>
            <span className="truncate text-[12px] font-bold text-neutral-400">
              @{user.username}
            </span>
          </div>
          <Link
            href="/arkadaslar"
            className="relative shrink-0 rounded-md border border-neutral-200 px-3 py-2 text-[11px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
          >
            {friendCount} ARKADAŞ
            {incoming > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-evos px-1 text-[10px] font-black text-white">
                {incoming}
              </span>
            )}
          </Link>
        </section>

        <PostComposer />

        <PostFeed
          query={{ scope: "feed" }}
          initialItems={items}
          initialCursor={cursor}
          pageSize={PAGE}
          emptyState={
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center">
              <p className="max-w-md text-sm text-neutral-500">
                Akışın henüz boş. Arkadaş ekleyip kullanıcıları takip ettikçe
                paylaşımlar burada görünecek. Dilersen ilk gönderiyi sen paylaş.
              </p>
              <div className="flex gap-2">
                <Link
                  href="/arkadaslar?sekme=oneriler"
                  className="rounded-md bg-evos px-5 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark"
                >
                  KİŞİ BUL
                </Link>
                <Link
                  href="/ilanlar"
                  className="rounded-md border border-neutral-300 px-5 py-2 text-[12px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
                >
                  İLANLARA GÖZ AT
                </Link>
              </div>
            </div>
          }
        />
      </div>

      {/* Yan sütun */}
      <aside className="hidden flex-col gap-4 lg:flex">
        <SuggestionList people={suggestions} />

        <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            SON HABERLER
          </h2>
          <ul className="flex flex-col gap-2.5">
            {latest.map((a) => (
              <li key={a.id} className="flex flex-col gap-0.5">
                <Link
                  href={`/haber/${a.slug}`}
                  className="line-clamp-2 text-[13px] font-bold leading-snug text-neutral-800 hover:text-evos"
                >
                  {a.title}
                </Link>
                <span
                  className="text-[10px] font-black"
                  style={{ color: a.category.color }}
                >
                  {a.category.name.toUpperCase()} · {timeAgo(a.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {bookmarks.length > 0 && (
          <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-wide text-neutral-800">
                KAYDEDİLENLER
              </h2>
              <Link
                href="/hesabim/kaydedilenler"
                className="text-[11px] font-black text-evos hover:underline"
              >
                TÜMÜ
              </Link>
            </div>
            <ul className="flex flex-col gap-2">
              {bookmarks.map((b) => (
                <li key={b.article.slug}>
                  <Link
                    href={`/haber/${b.article.slug}`}
                    className="line-clamp-2 text-[12px] font-bold text-neutral-600 hover:text-evos"
                  >
                    {b.article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
