import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  countFriends,
  getFeed,
  getFriendStatus,
  type FeedPost,
} from "@/lib/social";
import { formatDate, timeAgo } from "@/lib/utils";
import Avatar from "@/components/user/Avatar";
import FollowButton from "@/components/user/FollowButton";
import FriendButton from "@/components/social/FriendButton";
import PostComposer from "@/components/social/PostComposer";
import PostFeed from "@/components/social/PostFeed";
import { IconPlay } from "@/components/ui/Icons";
import type { SocialPost } from "@/components/social/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sekme?: string }>;
};

const toClient = (p: FeedPost) => p as unknown as SocialPost;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { name: true, bio: true, username: true },
  });
  if (!user) return { title: "Profil bulunamadı" };
  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio ?? `${user.name} kullanıcısının Evos Gazete profili.`,
  };
}

const STAT = "flex flex-col items-center gap-0.5 px-4";

const TABS = [
  { key: "gonderiler", label: "GÖNDERİLER" },
  { key: "reels", label: "REELS" },
  { key: "yorumlar", label: "YORUMLAR" },
  { key: "begeniler", label: "BEĞENDİKLERİ" },
] as const;

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { sekme } = await searchParams;
  const tab = TABS.some((t) => t.key === sekme) ? sekme! : "gonderiler";

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      city: true,
      website: true,
      twitter: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
  });
  if (!user || user.isBanned) notFound();

  const viewer = await getCurrentUser();
  const isSelf = viewer?.id === user.id;

  const [
    followers,
    following,
    isFollowing,
    friendCount,
    friendStatus,
    postCount,
    commentCount,
  ] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    viewer
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: user.id,
            },
          },
        })
      : null,
    countFriends(user.id),
    getFriendStatus(viewer?.id ?? null, user.id),
    prisma.post.count({ where: { authorId: user.id, isHidden: false } }),
    prisma.comment.count({ where: { userId: user.id } }),
  ]);

  // Sekmeye göre yalnızca gereken veri çekilir
  const posts =
    tab === "gonderiler" || tab === "reels"
      ? await getFeed({
          viewerId: viewer?.id ?? null,
          scope: "user",
          authorId: user.id,
          kind: tab === "reels" ? "reel" : undefined,
          limit: 10,
        })
      : [];

  const comments =
    tab === "yorumlar"
      ? await prisma.comment.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { article: { select: { title: true, slug: true } } },
        })
      : [];

  const likedArticles =
    tab === "begeniler"
      ? await prisma.articleLike.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
                category: { select: { name: true, color: true } },
              },
            },
          },
        })
      : [];

  const items = posts.map(toClient);
  const cursor = items.length > 0 ? items[items.length - 1].createdAt : null;

  return (
    <div className="flex flex-col gap-5 px-3 py-4 sm:px-0 sm:pt-6">
      {/* Profil kartı */}
      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:flex-row sm:items-start sm:gap-6">
        <Avatar src={user.avatar} name={user.name} size="xl" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900">{user.name}</h1>
            {user.role !== "uye" && (
              <span className="rounded bg-evos px-2 py-0.5 text-[10px] font-black text-white">
                {user.role.toUpperCase()}
              </span>
            )}
            {friendStatus === "friends" && (
              <span className="rounded bg-volt px-2 py-0.5 text-[10px] font-black text-white">
                ARKADAŞSINIZ
              </span>
            )}
          </div>
          <span className="text-sm text-neutral-400">@{user.username}</span>

          {user.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-neutral-400">
            {user.city && <span>📍 {user.city}</span>}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-evos hover:underline"
              >
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {user.twitter && (
              <a
                href={`https://x.com/${user.twitter}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-evos"
              >
                @{user.twitter}
              </a>
            )}
            <span>{formatDate(user.createdAt, false)} tarihinde katıldı</span>
          </div>

          <div className="mt-1 flex flex-wrap divide-x divide-neutral-200 self-start rounded-md border border-neutral-200 py-2">
            <span className={STAT}>
              <b className="text-lg font-black text-neutral-900">{postCount}</b>
              <span className="text-[11px] font-bold text-neutral-400">
                GÖNDERİ
              </span>
            </span>
            <Link href="/arkadaslar" className={`${STAT} hover:text-evos`}>
              <b className="text-lg font-black text-neutral-900">{friendCount}</b>
              <span className="text-[11px] font-bold text-neutral-400">
                ARKADAŞ
              </span>
            </Link>
            <span className={STAT}>
              <b className="text-lg font-black text-neutral-900">{followers}</b>
              <span className="text-[11px] font-bold text-neutral-400">
                TAKİPÇİ
              </span>
            </span>
            <span className={STAT}>
              <b className="text-lg font-black text-neutral-900">{following}</b>
              <span className="text-[11px] font-bold text-neutral-400">TAKİP</span>
            </span>
            <span className={STAT}>
              <b className="text-lg font-black text-neutral-900">
                {commentCount}
              </b>
              <span className="text-[11px] font-bold text-neutral-400">YORUM</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isSelf ? (
            <>
              <Link
                href="/hesabim"
                className="block rounded-md border border-neutral-300 px-5 py-2.5 text-center text-[13px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
              >
                PROFİLİ DÜZENLE
              </Link>
              <Link
                href="/reels/yeni"
                className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-5 py-2.5 text-[13px] font-black text-white transition hover:bg-evos"
              >
                <IconPlay className="h-4 w-4" />
                REEL YÜKLE
              </Link>
            </>
          ) : (
            <>
              <FriendButton
                username={user.username}
                initialStatus={friendStatus}
                initialCount={friendCount}
              />
              <FollowButton
                username={user.username}
                initialFollowing={Boolean(isFollowing)}
                initialFollowers={followers}
              />
            </>
          )}
        </div>
      </section>

      {/* Sekmeler */}
      <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/profil/${user.username}?sekme=${t.key}`}
            scroll={false}
            className={`shrink-0 rounded-md px-4 py-2 text-[12px] font-black transition ${
              tab === t.key
                ? "bg-evos text-white"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* GÖNDERİLER / REELS */}
      {(tab === "gonderiler" || tab === "reels") && (
        <div className="flex flex-col gap-3">
          {isSelf && tab === "gonderiler" && <PostComposer />}

          <PostFeed
            key={tab}
            query={{
              scope: "user",
              username: user.username,
              ...(tab === "reels" ? { kind: "reel" as const } : {}),
            }}
            initialItems={items}
            initialCursor={cursor}
            emptyState={
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center">
                <p className="max-w-md text-sm text-neutral-500">
                  {tab === "reels"
                    ? isSelf
                      ? "Henüz reel paylaşmadın. İlk dikey videonu yükle."
                      : "Bu kullanıcı henüz reel paylaşmamış."
                    : isSelf
                    ? "Henüz gönderi paylaşmadın. Yukarıdaki kutudan başlayabilirsin."
                    : "Bu kullanıcının sana açık bir gönderisi yok."}
                </p>
                {isSelf && tab === "reels" && (
                  <Link
                    href="/reels/yeni"
                    className="rounded-md bg-evos px-5 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark"
                  >
                    REEL YÜKLE
                  </Link>
                )}
              </div>
            }
          />
        </div>
      )}

      {/* YORUMLAR */}
      {tab === "yorumlar" && (
        <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            SON YORUMLARI
          </h2>

          {comments.length === 0 ? (
            <p className="rounded-md bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
              {isSelf
                ? "Henüz yorum yapmadın. Bir habere yorum bırakarak başla."
                : "Bu kullanıcı henüz yorum yapmamış."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                >
                  <Link
                    href={`/haber/${c.article.slug}#yorum-${c.id}`}
                    className="line-clamp-1 text-[12px] font-black text-evos hover:underline"
                  >
                    {c.article.title}
                  </Link>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                    {c.body}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                    <span>{timeAgo(c.createdAt)}</span>
                    <span>♥ {c.likes}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* BEĞENDİKLERİ */}
      {tab === "begeniler" && (
        <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            BEĞENDİĞİ HABERLER
          </h2>

          {likedArticles.length === 0 ? (
            <p className="rounded-md bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
              Henüz beğenilen haber yok.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {likedArticles.map(({ article }) => (
                <Link
                  key={article.id}
                  href={`/haber/${article.slug}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width:640px) 50vw, 220px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <span
                    className="text-[10px] font-black"
                    style={{ color: article.category.color }}
                  >
                    {article.category.name.toUpperCase()}
                  </span>
                  <span className="line-clamp-2 text-[13px] font-bold leading-snug text-neutral-800 group-hover:text-evos">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
