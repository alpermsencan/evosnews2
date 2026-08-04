import "server-only";
import { prisma } from "./prisma";

/**
 * Sosyal katmanın iş mantığı.
 *
 * Kavramlar:
 *  - Takip (Follow)     : tek yönlü, onay gerektirmez. "İçeriğini akışımda gör."
 *  - Arkadaşlık (Friend): çift yönlü, onaya tabi. "Arkadaşa özel paylaşımlarımı gör."
 *  - Gönderi (Post)     : kind = "text" (metin/görsel) veya "reel" (dikey video).
 *                         Beğeni/yorum/görünürlük/akış mantığı ikisinde de aynıdır.
 *  - Görünürlük         : public | friends | private
 */

export const POST_KINDS = ["text", "reel"] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const VISIBILITIES = ["public", "friends", "private"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: "Herkese açık",
  friends: "Arkadaşlarım",
  private: "Sadece ben",
};

/** Profil kartlarında kullanılan minimum kullanıcı alanları */
export const SOCIAL_USER_SELECT = {
  id: true,
  name: true,
  username: true,
  avatar: true,
  role: true,
} as const;

export const POST_SELECT = {
  id: true,
  kind: true,
  body: true,
  images: true,
  tags: true,
  videoUrl: true,
  posterUrl: true,
  durationSec: true,
  visibility: true,
  likeCount: true,
  commentCount: true,
  views: true,
  createdAt: true,
  author: { select: SOCIAL_USER_SELECT },
  article: {
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      spot: true,
      category: { select: { name: true, color: true } },
    },
  },
  vehicle: {
    select: { id: true, brand: true, model: true, slug: true, image: true, price: true },
  },
  listing: {
    select: { id: true, title: true, slug: true, image: true, price: true, city: true },
  },
} as const;

type RawPost = Awaited<
  ReturnType<typeof prisma.post.findMany<{ select: typeof POST_SELECT }>>
>[number];

export type FeedPost = Omit<RawPost, "createdAt"> & {
  createdAt: string;
  likedByMe: boolean;
  isMine: boolean;
};

// ---------------------------------------------------------------------------
// Arkadaşlık
// ---------------------------------------------------------------------------

export type FriendStatus =
  | "self"
  | "none"
  | "outgoing" // ben istek gönderdim, onay bekliyor
  | "incoming" // bana istek geldi
  | "friends";

/** Kabul edilmiş arkadaşların id listesi */
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return rows.map((r) => r.followingId);
}

/** İki kullanıcı arasındaki arkadaşlık kaydını yönden bağımsız bulur */
export async function findFriendship(a: string, b: string) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
}

export async function getFriendStatus(
  viewerId: string | null | undefined,
  targetId: string
): Promise<FriendStatus> {
  if (!viewerId) return "none";
  if (viewerId === targetId) return "self";

  const row = await findFriendship(viewerId, targetId);
  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  return row.requesterId === viewerId ? "outgoing" : "incoming";
}

export async function countFriends(userId: string) {
  return prisma.friendship.count({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });
}

// ---------------------------------------------------------------------------
// Görünürlük
// ---------------------------------------------------------------------------

/**
 * Bir kullanıcının görebileceği gönderileri sınırlayan Prisma koşulu.
 * Kendi gönderilerini her zaman, herkese açık olanları herkes,
 * "arkadaşlar" görünürlüğünü yalnızca kabul edilmiş arkadaşlar görür.
 */
export function visibilityWhere(viewerId: string | null, friendIds: string[]) {
  if (!viewerId) return { isHidden: false, visibility: "public" as const };

  return {
    isHidden: false,
    OR: [
      { authorId: viewerId },
      { visibility: "public" },
      ...(friendIds.length > 0
        ? [{ visibility: "friends", authorId: { in: friendIds } }]
        : []),
    ],
  };
}

export function normalizeVisibility(value: unknown): Visibility {
  return VISIBILITIES.includes(value as Visibility)
    ? (value as Visibility)
    : "public";
}

// ---------------------------------------------------------------------------
// Akış
// ---------------------------------------------------------------------------

export type FeedScope = "feed" | "explore" | "user" | "article";

export type FeedOptions = {
  viewerId: string | null;
  scope: FeedScope;
  kind?: PostKind;
  /** scope = "user" için hedef kullanıcı */
  authorId?: string;
  /** scope = "article" için hedef haber */
  articleId?: string;
  /** bu tarihten eski gönderiler (imleç) */
  before?: string | null;
  limit?: number;
};

/**
 * Akış sorgusu.
 *  - feed    : ben + takip ettiklerim + arkadaşlarım
 *  - explore : görebildiğim herkes (keşfet / reels)
 *  - user    : tek kullanıcının profili
 *  - article : bir habere iliştirilmiş gönderiler
 */
export async function getFeed(opts: FeedOptions): Promise<FeedPost[]> {
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 40);
  const viewerId = opts.viewerId ?? null;

  const friendIds = viewerId ? await getFriendIds(viewerId) : [];
  const base = visibilityWhere(viewerId, friendIds);

  const where: Record<string, unknown> = { ...base };
  if (opts.kind) where.kind = opts.kind;
  if (opts.before) where.createdAt = { lt: new Date(opts.before) };

  if (opts.scope === "user" && opts.authorId) {
    where.authorId = opts.authorId;
  } else if (opts.scope === "article" && opts.articleId) {
    where.articleId = opts.articleId;
  } else if (opts.scope === "feed") {
    if (!viewerId) return [];
    const followingIds = await getFollowingIds(viewerId);
    const circle = Array.from(new Set([viewerId, ...followingIds, ...friendIds]));
    where.authorId = { in: circle };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: POST_SELECT,
  });

  return decoratePosts(posts, viewerId);
}

/** Gönderilere "beğendim mi / benim mi" bilgisini ekler ve tarihi serileştirir */
export async function decoratePosts(
  posts: RawPost[],
  viewerId: string | null
): Promise<FeedPost[]> {
  let liked = new Set<string>();

  if (viewerId && posts.length > 0) {
    const rows = await prisma.postLike.findMany({
      where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    });
    liked = new Set(rows.map((r) => r.postId));
  }

  return posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    likedByMe: liked.has(p.id),
    isMine: Boolean(viewerId) && p.author.id === viewerId,
  }));
}

/** Tek gönderiyi görüntüleyebilir miyim? */
export async function canViewPost(
  post: { authorId: string; visibility: string; isHidden: boolean },
  viewerId: string | null
) {
  if (post.isHidden) return false;
  if (post.visibility === "public") return true;
  if (!viewerId) return false;
  if (post.authorId === viewerId) return true;
  if (post.visibility === "private") return false;

  const row = await findFriendship(viewerId, post.authorId);
  return row?.status === "accepted";
}

// ---------------------------------------------------------------------------
// Kişi önerileri
// ---------------------------------------------------------------------------

/**
 * "Tanıyor olabilirsin": önce arkadaşlarımın arkadaşları, yetmezse
 * platformdaki aktif üyeler. Zaten arkadaş/istek durumunda olanlar elenir.
 */
export async function getPeopleSuggestions(userId: string, limit = 8) {
  const [friendIds, followingIds, pending] = await Promise.all([
    getFriendIds(userId),
    getFollowingIds(userId),
    prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    }),
  ]);

  const excluded = new Set<string>([userId]);
  for (const p of pending) {
    excluded.add(p.requesterId);
    excluded.add(p.addresseeId);
  }

  const mutuals = new Map<string, number>();
  if (friendIds.length > 0) {
    const second = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [
          { requesterId: { in: friendIds } },
          { addresseeId: { in: friendIds } },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });

    for (const row of second) {
      for (const side of [row.requesterId, row.addresseeId]) {
        if (excluded.has(side) || friendIds.includes(side)) continue;
        mutuals.set(side, (mutuals.get(side) ?? 0) + 1);
      }
    }
  }

  const rankedIds = [...mutuals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const people = rankedIds.length
    ? await prisma.user.findMany({
        where: { id: { in: rankedIds }, isBanned: false },
        select: { ...SOCIAL_USER_SELECT, bio: true, city: true },
      })
    : [];

  // Yeterli öneri çıkmadıysa son katılan üyelerle tamamla
  if (people.length < limit) {
    const fill = await prisma.user.findMany({
      where: {
        isBanned: false,
        id: { notIn: [...excluded, ...people.map((p) => p.id)] },
      },
      orderBy: { createdAt: "desc" },
      take: limit - people.length,
      select: { ...SOCIAL_USER_SELECT, bio: true, city: true },
    });
    people.push(...fill);
  }

  return people.map((p) => ({
    ...p,
    mutualCount: mutuals.get(p.id) ?? 0,
    isFollowing: followingIds.includes(p.id),
  }));
}

/** İlk 200 karakteri özet olarak döndürür (bildirim metinleri için) */
export function excerpt(text: string, max = 60) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}
