import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { TAGS, TTL } from "./cache";

export const ARTICLE_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  spot: true,
  image: true,
  tags: true,
  isBreaking: true,
  isVideo: true,
  isFeatured: true,
  views: true,
  readTime: true,
  publishedAt: true,
  sourceName: true,
  sourceUrl: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { name: true, slug: true, avatar: true } },
} as const;

/**
 * Yayın filtresi.
 * Ingest edilen içerik DRAFT olarak gelir ve editör onaylayana kadar sitenin
 * hiçbir yerinde görünmemelidir. Her genel okuma bu koşulu içerir.
 */
const PUBLISHED = { status: "PUBLISHED" } as const;

/**
 * ÖNBELLEKLEME NEDEN YOK
 *
 * Bu sorgular daha önce `unstable_cache` ile etiketli olarak önbellekleniyordu.
 * Sorun şu: `revalidateTag` girdiyi silmez, BAYAT işaretler — bayat girdi bir
 * sonraki isteğe olduğu gibi servis edilir, tazeleme arka planda yapılır.
 * Sonuç: panelden bir haber düzenlendiğinde sayfayı ilk açan ziyaretçi hâlâ
 * eski içeriği görüyordu. Anında geçersiz kılan `updateTag` ise yalnızca
 * Server Action içinden çağrılabiliyor, route handler'lardan çağrılamıyor.
 *
 * Sitenin tüm sayfaları zaten istek başına render ediliyor (kök layout oturumu
 * sunucuda okuyor), yani önbellek yalnızca birkaç indeksli Mongo sorgusunu
 * tasarruf ediyordu. Doğruluk bu tasarruftan değerli olduğu için okumalar
 * doğrudan yapılıyor.
 *
 * Tek istisna: getPublishedIndex (sitemap/RSS için binlerce kayıt). Orada
 * saniyelik tazelik gereksiz, maliyet ise yüksek olduğu için önbellek kalıyor.
 */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: string[],
  revalidate: number,
) {
  return unstable_cache(fn, keyParts, { tags, revalidate });
}

export const getCategories = () => prisma.category.findMany({ orderBy: { order: "asc" } });

export const getCategoryBySlug = (slug: string) => prisma.category.findUnique({ where: { slug } });

/**
 * Manşet carousel'i.
 *
 * Öncelik sırası: editörün MANŞET işaretlediği haberler → öne çıkarılanlar →
 * en yeni yayındaki haberler. Panelden hiç manşet seçilmemişse (ilk kurulum ya
 * da ingest'ten gelen içerikte bayrak set edilmediğinde) carousel boş kalıp
 * sayfadan tamamen kaybolmasın diye bu geri düşüş var. Görselsiz haber
 * carousel'de kırık kutu gibi durduğu için elenir.
 */
export const getHeadlines = async (limit: number = 6) => {
  const where = { ...PUBLISHED, NOT: { image: "" } } as const;
  const query = (extra: object, take: number) =>
    prisma.article.findMany({
      where: { ...where, ...extra },
      orderBy: { publishedAt: "desc" },
      take,
      select: ARTICLE_CARD_SELECT,
    });

  const slides = await query({ isHeadline: true }, limit);
  if (slides.length >= limit) return slides;

  const seen = new Set(slides.map((a) => a.id));
  for (const extra of [{ isFeatured: true }, {}]) {
    const fill = await query(extra, limit * 2);
    for (const a of fill) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      slides.push(a);
      if (slides.length === limit) return slides;
    }
  }
  return slides;
};

export const getLatest = (limit: number = 12, skip: number = 0) =>
    prisma.article.findMany({
      where: PUBLISHED,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip,
      select: ARTICLE_CARD_SELECT,
    });

export const getMostRead = (limit: number = 8) =>
    prisma.article.findMany({
      where: PUBLISHED,
      orderBy: { views: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });

export const getByCategory = (slug: string, limit: number = 8, skip: number = 0) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, category: { slug } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip,
      select: ARTICLE_CARD_SELECT,
    });

export const countByCategory = (slug: string) => prisma.article.count({ where: { ...PUBLISHED, category: { slug } } });

/**
 * Haber detayı. Taslak/reddedilmiş içerik genel tarafta 404 döner.
 *
 * Yorumlar bilerek DIŞARIDA bırakıldı: haber gövdesi nadiren, yorumlar sürekli
 * değişir. İkisi aynı önbellek girdisinde olsaydı yeni bir yorum, TTL dolana
 * kadar diğer ziyaretçilere görünmezdi. Yorumlar getArticleComments ile
 * önbelleksiz okunur.
 */
export const getArticleBySlug = async (slug: string) => {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { category: true, author: true },
    });
    return article && article.status === "PUBLISHED" ? article : null;
  };

/**
 * Haber yorumları — ÖNBELLEKLENMEZ.
 * Yorum yazan kişi kendi yorumunu istemci tarafında anında görür; bu sorgu
 * diğer ziyaretçilerin de gecikmesiz görmesini sağlar.
 */
export function getArticleComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, approved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
    },
  });
}

export const getRelated = (categoryId: string, excludeId: string, limit: number = 4) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, categoryId, NOT: { id: excludeId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });

/**
 * Sitemap ve RSS için: yayındaki tüm haberlerin hafif listesi.
 *
 * Tek önbelleklenen sorgu. Binlerce kayıt döndürdüğü için maliyetlidir, buna
 * karşılık okuyucusu arama motoru tarayıcısıdır; birkaç dakikalık gecikme
 * önemsizdir. Yeni içerik geldiğinde `touchArticles()` etiketi tazeler.
 */
export const getPublishedIndex = cached(
  (limit: number = 5000) =>
    prisma.article.findMany({
      where: PUBLISHED,
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        slug: true,
        title: true,
        spot: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
  ["published-index"],
  [TAGS.articles],
  TTL.articles,
);

/** Kök layout'taki son dakika şeridi. */
export const getBreakingBar = (limit: number = 8) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, OR: [{ isBreaking: true }, { isFeatured: true }] },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { id: true, title: true, slug: true },
    });

export const getTickers = () => prisma.ticker.findMany({ orderBy: { order: "asc" } });

export const getActivePoll = () =>
    prisma.poll.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

/**
 * Serbest filtreli araç sorgusu (arama/filtre ekranları).
 * Filtre kombinasyonu sınırsız olduğundan önbelleklenmez.
 *
 * NOT: Araç detayı, şarj istasyonu listesi ve ÖTV dilimleri için burada
 * önbellekli yardımcı YOKTUR. İlgili sayfalar prisma'ya doğrudan gider;
 * böylece panelden yapılan bir düzenleme anında yansır.
 */
export async function getVehicles(
  where: Record<string, unknown> = {},
  orderBy: Record<string, unknown> = { price: "asc" },
) {
  return prisma.vehicle.findMany({ where, orderBy });
}

export const getFeaturedVehicles = (limit: number = 6) =>
    prisma.vehicle.findMany({
      where: { isFeatured: true },
      orderBy: { rangeKm: "desc" },
      take: limit,
      include: { syncImages: true },
    });



export const getCommunityPosts = (limit: number | undefined) =>
    prisma.communityPost.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

export const getPriceIndex = () => prisma.priceIndex.findMany({ orderBy: { order: "asc" } });


/** Arama sorgusu kullanıcıya özgüdür; önbelleklenmez. */
export async function searchArticles(q: string, limit = 30) {
  if (!q?.trim()) return [];
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { spot: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export type ArticleCard = Awaited<ReturnType<typeof getLatest>>[number];
